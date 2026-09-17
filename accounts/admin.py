# accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import Address, OtpCode, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    پنل مدیریت کاربر سفارشی.
    چون username=None است، باید fieldsets را کامل بازنویسی کنیم
    تا خطای 'username field not found' رخ ندهد.
    """
    ordering = ("phone",)
    list_display = ("phone", "first_name", "last_name", "email", "is_staff", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("phone", "first_name", "last_name", "email")

    # فیلدهای نمایش هنگام ویرایش کاربر موجود
    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        (_("اطلاعات شخصی"), {"fields": ("first_name", "last_name", "email")}),
        (
            _("دسترسی‌ها"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("تاریخ‌های مهم"), {"fields": ("last_login", "date_joined")}),
    )

    # فیلدهای نمایش هنگام ایجاد کاربر جدید از پنل
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("phone", "first_name", "last_name", "password1", "password2"),
            },
        ),
    )

    # جلوگیری از ویرایش تصادفی فیلدهای حساس
    readonly_fields = ("last_login", "date_joined")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "province", "city", "postal_code")
    search_fields = ("user__phone", "city", "province", "postal_code")
    list_select_related = ("user",)  # بهینه‌سازی query برای نمایش phone کاربر
    autocomplete_fields = ("user",)


@admin.register(OtpCode)
class OtpCodeAdmin(admin.ModelAdmin):
    list_display = ("phone", "code", "created_at", "is_used")
    list_filter = ("is_used",)
    search_fields = ("phone",)
    readonly_fields = ("created_at",)  # زمان ایجاد نباید قابل ویرایش باشد

    def has_add_permission(self, request):
        # کدهای OTP نباید دستی ایجاد شوند
        return False
