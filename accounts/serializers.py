from rest_framework import serializers
import re
from .models import User, Address, StoreSetting


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
    role = serializers.SerializerMethodField()
    is_profile_complete = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id", "phone", "first_name", "last_name", "email",
            "role", "is_profile_complete",
        ]
        read_only_fields = ["id", "phone"]

    def get_role(self, obj):
        return "admin" if obj.is_staff or obj.is_superuser else "customer"


class StoreSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSetting
        fields = [
            "store_name", "support_phone", "support_email", "address",
            "instagram_url", "telegram_url", "announcement", "updated_at",
        ]
        read_only_fields = ["updated_at"]


class AdminCustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    phone = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    is_active = serializers.BooleanField()
    date_joined = serializers.DateTimeField()
    orders_count = serializers.IntegerField()
    total_spent = serializers.FloatField()


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "province", "city", "street", "postal_code", "detail"]


class CompleteRegistrationSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField(required=False, allow_blank=True)
    province = serializers.CharField(max_length=100)
    city = serializers.CharField(max_length=100)
    street = serializers.CharField(max_length=255)
    postal_code = serializers.CharField(min_length=10, max_length=10)
    detail = serializers.CharField(required=False, allow_blank=True)

    def validate_postal_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("کد پستی باید فقط عدد باشد")
        return value

    def validate(self, attrs):
        for field in ("first_name", "last_name", "province", "city", "street"):
            if not attrs[field].strip():
                raise serializers.ValidationError({field: "این فیلد الزامی است"})
        return attrs
