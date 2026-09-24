"""Password recovery is isolated from the existing OTP registration flow."""
import secrets
from datetime import timedelta

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core import signing
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone, translation
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import PasswordRecovery, User
from .serializers import RequestOtpSerializer, UserSerializer, VerifyOtpSerializer
from .sms import send_otp
from .views import get_tokens_for_user


class RecoveryThrottle(AnonRateThrottle):
    scope = 'password_recovery'
    rate = '20/hour'


class PublicAuthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [RecoveryThrottle]


class RequestPasswordResetView(PublicAuthView):
    @transaction.atomic
    def post(self, request):
        serializer = RequestOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.select_for_update().filter(
            phone=serializer.validated_data['phone'], is_active=True,
        ).first()
        message = {'detail': 'اگر حساب فعالی با این شماره وجود داشته باشد، کد بازیابی ارسال می‌شود.', 'retry_after': 120}
        if not user:
            return Response(message)
        previous = PasswordRecovery.objects.filter(user=user).first()
        if previous and previous.created_at > timezone.now() - timedelta(seconds=120):
            remaining = max(1, 120 - int((timezone.now() - previous.created_at).total_seconds()))
            return Response({'detail': 'برای ارسال مجدد کد کمی صبر کنید.', 'retry_after': remaining}, status=429)
        code = f'{secrets.randbelow(1000000):06d}'
        if not send_otp(user.phone, code):
            return Response({'detail': 'ارسال پیامک انجام نشد. دوباره تلاش کنید.'}, status=503)
        PasswordRecovery.objects.update_or_create(user=user, defaults={
            'code_hash': make_password(code), 'created_at': timezone.now(),
            'attempts': 0, 'verified': False, 'consumed': False,
        })
        return Response(message)


class VerifyPasswordResetView(PublicAuthView):
    @transaction.atomic
    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        recovery = PasswordRecovery.objects.select_for_update().filter(
            user__phone=data['phone'], user__is_active=True,
        ).first()
        if (not recovery or recovery.consumed or recovery.verified or recovery.attempts >= 5
                or recovery.created_at <= timezone.now() - timedelta(minutes=5)):
            return Response({'detail': 'کد معتبر نیست یا منقضی شده است. کد جدید دریافت کنید.'}, status=400)
        recovery.attempts += 1
        recovery.save(update_fields=['attempts'])
        if not check_password(data['code'], recovery.code_hash):
            return Response({'detail': 'کد واردشده اشتباه است.'}, status=400)
        recovery.verified = True
        recovery.save(update_fields=['verified'])
        token = signing.dumps({'id': recovery.pk, 'version': recovery.code_hash}, salt='password-reset')
        return Response({'reset_token': token})


class ResetSerializer(serializers.Serializer):
    reset_token = serializers.CharField(max_length=1024)
    password = serializers.CharField(max_length=128, trim_whitespace=False)
    password_confirm = serializers.CharField(max_length=128, trim_whitespace=False)


class ResetPasswordView(PublicAuthView):
    @transaction.atomic
    def post(self, request):
        serializer = ResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            payload = signing.loads(data['reset_token'], salt='password-reset', max_age=600)
        except signing.BadSignature:
            return Response({'detail': 'مهلت تغییر رمز تمام شده است. دوباره کد دریافت کنید.'}, status=400)
        recovery = PasswordRecovery.objects.select_for_update().filter(
            pk=payload['id'], code_hash=payload['version'], verified=True,
            consumed=False, user__is_active=True,
        ).first()
        if not recovery:
            return Response({'detail': 'درخواست بازیابی معتبر نیست.'}, status=400)
        if data['password'] != data['password_confirm']:
            return Response({'detail': 'رمز عبور و تکرار آن یکسان نیستند.'}, status=400)
        user = User.objects.select_for_update().get(pk=recovery.user_id)
        try:
            with translation.override('fa'):
                validate_password(data['password'], user)
        except ValidationError as error:
            return Response({'detail': ' '.join(error.messages)}, status=400)
        user.set_password(data['password'])
        user.save(update_fields=['password'])
        recovery.consumed = True
        recovery.save(update_fields=['consumed'])
        return Response({'detail': 'رمز عبور با موفقیت تغییر کرد.'})


class PasswordLoginSerializer(RequestOtpSerializer):
    password = serializers.CharField(max_length=128, trim_whitespace=False)


class PasswordLoginView(PublicAuthView):
    def post(self, request):
        serializer = PasswordLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request=request, **serializer.validated_data)
        if not user:
            return Response({'detail': 'شماره موبایل یا رمز عبور اشتباه است.'}, status=400)
        return Response({**get_tokens_for_user(user), 'user': UserSerializer(user).data})
