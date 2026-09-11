from rest_framework import serializers
import re
from .models import User, Address


def validate_iranian_phone(value: str) -> str:
    if not re.match(r"^09[0-9]{9}$", value):
        raise serializers.ValidationError("شماره موبایل معتبر نیست (مثال: 09123456789)")
    return value


class RequestOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)

    def validate_phone(self, value):
        return validate_iranian_phone(value)


class VerifyOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    code = serializers.CharField(max_length=6, min_length=6)

    def validate_phone(self, value):
        return validate_iranian_phone(value)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("کد باید فقط عدد باشد")
        return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "phone", "first_name", "last_name", "email"]
        read_only_fields = ["id", "phone"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "province", "city", "street", "postal_code", "detail"]
