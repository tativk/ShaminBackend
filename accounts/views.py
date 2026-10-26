from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count, Q, Sum
from django.shortcuts import render, get_object_or_404

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.db import transaction

from config.permissions import IsStaffUser

from .serializers import (
    AddressSerializer,
    AdminCreateSerializer,
    AdminListSerializer,
    ChangePhoneSerializer,
    CompleteRegistrationSerializer,
    RequestOtpSerializer,
    StoreSettingSerializer,
    UserSerializer,
    VerifyOtpSerializer,
    AdminCustomerSerializer,
)
from .services import create_and_send_otp, verify_otp_and_get_user
from .models import Address, StoreSetting
from orders.models import OrderItem

User = get_user_model()

# سفارش‌هایی که در «مجموع خرید» مشتری حساب می‌شوند
CUSTOMER_PAID_STATUSES = ("paid", "shipping", "completed")


class AdminCustomersView(APIView):
    """فهرست مشتریان برای پنل ادمین + فعال/مسدودسازی."""
    permission_classes = [IsStaffUser]

    def get(self, request):
        users = (
            User.objects
            .filter(is_staff=False, is_superuser=False)
            .annotate(
                orders_count=Count("orders", distinct=True),
                total_spent=Sum(
                    "orders__total_price",
                    filter=Q(orders__status__in=CUSTOMER_PAID_STATUSES),
                ),
            )
            .order_by("-date_joined")
        )
        data = [
            {
                "id": u.id,
                "phone": u.phone,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "email": u.email,
                "is_active": u.is_active,
                "date_joined": u.date_joined,
                "orders_count": u.orders_count or 0,
                "total_spent": float(u.total_spent or 0),
            }
            for u in users
        ]
        return Response(AdminCustomerSerializer(data, many=True).data)

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk, is_staff=False, is_superuser=False)
        is_active = request.data.get("is_active")
        if is_active is None:
            return Response(
                {"detail": "مقدار is_active الزامی است."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.is_active = bool(is_active)
        user.save(update_fields=["is_active"])
        return Response({"id": user.id, "is_active": user.is_active})


class AdminAdminsView(APIView):
    """مدیریت ادمین‌ها از پنل ادمین: فهرست + افزودن دستی + فعال/غیرفعال."""
    permission_classes = [IsStaffUser]

    def get(self, request):
        admins = User.objects.filter(is_staff=True).order_by("date_joined")
        return Response(AdminListSerializer(admins, many=True).data)

    def post(self, request):
        serializer = AdminCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if User.objects.filter(phone=data["phone"]).exists():
            return Response(
                {"phone": ["این شماره قبلاً ثبت شده است."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        admin = User.objects.create_user(phone=data["phone"])
        admin.first_name = data.get("first_name", "").strip()
        admin.last_name = data.get("last_name", "").strip()
        admin.email = data.get("email", "").strip()
        admin.is_staff = True
        admin.is_active = True
        admin.set_password(data["password"])
        admin.save()
        return Response(AdminListSerializer(admin).data, status=status.HTTP_201_CREATED)

    def patch(self, request, pk):
        admin = get_object_or_404(User, pk=pk, is_staff=True)
        is_active = request.data.get("is_active")
        if is_active is None:
            return Response({"detail": "مقدار is_active الزامی است."}, status=status.HTTP_400_BAD_REQUEST)
        if admin.pk == request.user.pk and not is_active:
            return Response({"detail": "نمی‌توانید حساب خودتان را غیرفعال کنید."}, status=status.HTTP_400_BAD_REQUEST)
        admin.is_active = bool(is_active)
        admin.save(update_fields=["is_active"])
        return Response({"id": admin.id, "is_active": admin.is_active})


class ChangePhoneView(APIView):
    """تغییر شماره موبایل خود کاربر/ادمین با تأیید رمز عبور فعلی."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not request.user.check_password(data["current_password"]):
            return Response(
                {"current_password": ["رمز عبور فعلی اشتباه است."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(phone=data["phone"]).exclude(pk=request.user.pk).exists():
            return Response(
                {"phone": ["این شماره قبلاً ثبت شده است."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.phone = data["phone"]
        request.user.save(update_fields=["phone"])
        # توکن‌های قدیمی به شماره گره ندارند اما پروفایل ذخیره‌شده در مرورگر تازه شود
        return Response(UserSerializer(request.user).data)


class StoreSettingsView(APIView):
    """تنظیمات فروشگاه — خواندن عمومی، ویرایش فقط ادمین."""

    def get_permissions(self):
        if self.request.method == "PUT":
            return [IsStaffUser()]
        return [AllowAny()]

    def get(self, request):
        return Response(StoreSettingSerializer(StoreSetting.load()).data)

    def put(self, request):
        serializer = StoreSettingSerializer(StoreSetting.load(), data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    from .notification_signals import record_login
    record_login(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class PasswordLoginView(APIView):
    """ورود با شماره موبایل و رمز عبور — برای کاربرانی که پسورد ست کرده‌اند."""

    permission_classes = [AllowAny]

    @extend_schema(
        summary="ورود با شماره موبایل و رمز عبور",
        tags=["احراز هویت"],
    )
    def post(self, request):
        phone = str(request.data.get("phone") or "").strip()
        password = str(request.data.get("password") or "")

        user = authenticate(request, username=phone, password=password)
        if user is None:
            return Response(
                {"detail": "شماره موبایل یا رمز عبور اشتباه است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tokens = get_tokens_for_user(user)
        return Response({
            **tokens,
            "user": UserSerializer(user).data,
            "next_step": "dashboard" if user.is_profile_complete else "complete_registration",
        }, status=status.HTTP_200_OK)


class OtpRequestThrottle(AnonRateThrottle):
    """محدودیت نرخ درخواست کد پیامکی — جلوگیری از اسپم SMS."""
    scope = 'otp_request'


class OtpVerifyThrottle(AnonRateThrottle):
    """محدودیت تأیید کد — جلوگیری از حدس کد ۶ رقمی."""
    scope = 'otp_verify'


class RegisterView(APIView):
    """ثبت‌نام با شماره موبایل و رمز عبور — سپس تأیید با کد پیامکی."""

    permission_classes = [AllowAny]
    throttle_classes = [OtpRequestThrottle]

    @extend_schema(
        summary="ثبت‌نام با شماره موبایل و رمز عبور",
        tags=["احراز هویت"],
    )
    def post(self, request):
        serializer = RequestOtpSerializer(data={"phone": request.data.get("phone", "")})
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]
        password = str(request.data.get("password") or "")

        if len(password) < 4:
            return Response(
                {"detail": "رمز عبور باید حداقل ۴ کاراکتر باشد."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(phone=phone).first()
        if user and user.has_usable_password():
            return Response(
                {"detail": "این شماره قبلاً ثبت‌نام کرده است؛ وارد شوید."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user is None:
            user = User.objects.create_user(phone=phone)
        user.set_password(password)
        user.save()

        # ارسال کد تأیید؛ خطای cooldown گذرنده است چون پسورد ثبت شده
        success, message = create_and_send_otp(phone)
        return Response(
            {"detail": message if not success else "کد تأیید ارسال شد."},
            status=status.HTTP_201_CREATED,
        )


class RequestOtpView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [OtpRequestThrottle]

    @extend_schema(
        request=RequestOtpSerializer,
        responses={200: OpenApiResponse(description="کد ارسال شد"), 400: OpenApiResponse(description="خطا")},
        summary="درخواست کد OTP",
        tags=["احراز هویت"],
    )
    def post(self, request):
        serializer = RequestOtpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data["phone"]
        success, message = create_and_send_otp(phone)

        if not success:
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": message}, status=status.HTTP_200_OK)


class VerifyOtpView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [OtpVerifyThrottle]

    @extend_schema(
        request=VerifyOtpSerializer,
        responses={200: OpenApiResponse(description="توکن + اطلاعات کاربر"), 400: OpenApiResponse(description="خطا")},
        summary="تأیید OTP و دریافت توکن",
        tags=["احراز هویت"],
    )
    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data["phone"]
        code = serializer.validated_data["code"]

        user, error = verify_otp_and_get_user(phone, code)
        if not user:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        tokens = get_tokens_for_user(user)
        return Response({
            **tokens,
            "user": UserSerializer(user).data,
            "next_step": "dashboard" if user.is_profile_complete else "complete_registration",
        }, status=status.HTTP_200_OK)


class CompleteRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=CompleteRegistrationSerializer,
        responses={200: UserSerializer, 400: OpenApiResponse(description="خطا")},
        summary="تکمیل ثبت‌نام کاربر",
        tags=["احراز هویت"],
    )
    @transaction.atomic
    def post(self, request):
        serializer = CompleteRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        request.user.first_name = data["first_name"].strip()
        request.user.last_name = data["last_name"].strip()
        request.user.email = data.get("email", "").strip()
        request.user.save(update_fields=["first_name", "last_name", "email"])

        address_data = {
            field: data[field]
            for field in ("province", "city", "street", "postal_code", "detail")
            if field in data
        }
        Address.objects.update_or_create(
            user=request.user,
            defaults=address_data,
        )
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class PurchasedProductsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="محصولات خریداری‌شده", tags=["کاربر"])
    def get(self, request):
        from orders.models import Order

        order_items = (
            OrderItem.objects
            .filter(order__user=request.user, order__status=Order.Status.PAID)
            .select_related("product", "order")
            .order_by("-order__created_at")
        )
        return Response([
            {
                "product_id": item.product_id,
                "product_name": item.product.name,
                "quantity": item.quantity,
                "unit_price": item.price,
                "order_id": item.order_id,
                "purchased_at": item.order.created_at,
            }
            for item in order_items
        ])


class ProfileView(APIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="دریافت پروفایل", tags=["کاربر"])
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    @extend_schema(request=UserSerializer, summary="ویرایش پروفایل", tags=["کاربر"])
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)


class AddressView(APIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="دریافت آدرس", tags=["کاربر"])
    def get(self, request):
        try:
            address = request.user.address
            return Response(AddressSerializer(address).data)
        except Address.DoesNotExist:
            return Response({}, status=status.HTTP_200_OK)

    @extend_schema(request=AddressSerializer, summary="ذخیره/ویرایش آدرس", tags=["کاربر"])
    def put(self, request):
        try:
            address = request.user.address
            serializer = AddressSerializer(address, data=request.data)
        except Address.DoesNotExist:
            serializer = AddressSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=request.user)
        return Response(serializer.data)
