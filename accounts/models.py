from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import random
import string
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("شماره موبایل الزامی است")
        user = self.model(phone=phone, **extra_fields)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        user = self.model(phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractUser):
    username = None
    phone = models.CharField(max_length=11, unique=True, verbose_name="موبایل")
    first_name = models.CharField(max_length=50, blank=True, verbose_name="نام")
    last_name = models.CharField(max_length=50, blank=True, verbose_name="نام خانوادگی")
    email = models.EmailField(blank=True, verbose_name="ایمیل")
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    objects = UserManager()

    @property
    def is_profile_complete(self):
        if self.is_staff or self.is_superuser:
            return True
        if not self.first_name.strip() or not self.last_name.strip():
            return False
        try:
            address = self.address
        except Address.DoesNotExist:
            return False
        return all([
            address.province.strip(),
            address.city.strip(),
            address.street.strip(),
            address.postal_code.strip(),
        ])

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"

    def __str__(self):
        return self.phone


class Address(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="address", verbose_name="کاربر")
    province = models.CharField(max_length=100, verbose_name="استان")
    city = models.CharField(max_length=100, verbose_name="شهر")
    street = models.CharField(max_length=255, verbose_name="خیابان")
    postal_code = models.CharField(max_length=10, blank=True, verbose_name="کد پستی")
    detail = models.TextField(blank=True, verbose_name="جزئیات آدرس")

    class Meta:
        verbose_name = "آدرس"
        verbose_name_plural = "آدرس‌ها"

    def __str__(self):
        return f"{self.user.phone} — {self.city}"


class StoreSetting(models.Model):
    """تنظیمات تک‌ردیفی فروشگاه — از پنل ادمین ویرایش می‌شود."""
    store_name = models.CharField("نام فروشگاه", max_length=100, default="گالری شمین")
    support_phone = models.CharField("تلفن پشتیبانی", max_length=30, blank=True, default="")
    support_email = models.EmailField("ایمیل پشتیبانی", blank=True, default="")
    address = models.CharField("آدرس", max_length=255, blank=True, default="")
    instagram_url = models.URLField("اینستاگرام", blank=True, default="")
    telegram_url = models.URLField("تلگرام", blank=True, default="")
    announcement = models.CharField("اعلان سایت", max_length=200, blank=True, default="")
    updated_at = models.DateTimeField("آخرین تغییر", auto_now=True)

    class Meta:
        verbose_name = "تنظیمات فروشگاه"
        verbose_name_plural = "تنظیمات فروشگاه"

    def __str__(self):
        return self.store_name

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class OtpCode(models.Model):
    phone = models.CharField(max_length=11, verbose_name="موبایل")
    code = models.CharField(max_length=6, verbose_name="کد OTP")
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False, verbose_name="استفاده شده")

    class Meta:
        verbose_name = "کد OTP"
        verbose_name_plural = "کدهای OTP"

    def is_valid(self):
        """کد حداکثر ۵ دقیقه اعتبار دارد"""
        expiry = self.created_at + timedelta(minutes=5)
        return not self.is_used and timezone.now() < expiry

    def __str__(self):
        return f"{self.phone} — {self.code}"

    @classmethod
    def generate_code(cls):
        return "".join(random.choices(string.digits, k=6))

class PasswordRecovery(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(default=timezone.now)
    attempts = models.PositiveSmallIntegerField(default=0)
    verified = models.BooleanField(default=False)
    consumed = models.BooleanField(default=False)


class AdminNotification(models.Model):
    kind = models.CharField(max_length=24)
    title = models.CharField(max_length=200)
    message = models.TextField()
    section = models.CharField(max_length=24, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    read_by = models.ManyToManyField(User, blank=True, related_name='read_notifications')

    class Meta:
        ordering = ['-id']
