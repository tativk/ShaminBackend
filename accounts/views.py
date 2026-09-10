from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import RequestOtpSerializer, VerifyOtpSerializer, UserSerializer, AddressSerializer
from .services import create_and_send_otp, verify_otp_and_get_user
from .models import Address


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


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
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
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
