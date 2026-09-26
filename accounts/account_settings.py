"""Authenticated account-settings actions used by the admin panel."""
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import translation
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(max_length=128, trim_whitespace=False)
    password = serializers.CharField(max_length=128, trim_whitespace=False)
    password_confirm = serializers.CharField(max_length=128, trim_whitespace=False)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if not request.user.check_password(data['current_password']):
            return Response({'current_password': ['رمز عبور فعلی اشتباه است.']}, status=400)
        if data['password'] == data['current_password']:
            return Response({'password': ['رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد.']}, status=400)
        if data['password'] != data['password_confirm']:
            return Response({'password_confirm': ['رمز عبور جدید و تکرار آن یکسان نیستند.']}, status=400)
        try:
            with translation.override('fa'):
                validate_password(data['password'], request.user)
        except ValidationError as error:
            return Response({'password': error.messages}, status=400)

        request.user.set_password(data['password'])
        request.user.save(update_fields=['password'])
        return Response({'detail': 'رمز عبور با موفقیت تغییر کرد.'})
