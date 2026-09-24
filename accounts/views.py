from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.db import transaction

from .serializers import (
    AddressSerializer,
    CompleteRegistrationSerializer,
    RequestOtpSerializer,
    UserSerializer,
    VerifyOtpSerializer,
)
from .services import create_and_send_otp, verify_otp_and_get_user
from .models import Address
from orders.models import OrderItem

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
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


class RegisterView(APIView):
    """ثبت‌نام با شماره موبایل و رمز عبور — سپس تأیید با کد پیامکی."""

    permission_classes = [AllowAny]

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
