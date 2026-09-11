from django.contrib import admin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address, OtpCode


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-date_joined"]
    list_display = ["phone", "first_name", "last_name", "is_active", "date_joined"]
    list_filter = ["is_active", "is_staff"]
    search_fields = ["phone", "first_name", "last_name"]
    fieldsets = (
        (None, {"fields": ("phone",)}),
        ("اطلاعات شخصی", {"fields": ("first_name", "last_name", "email")}),
        ("دسترسی‌ها", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {"fields": ("phone", "password1", "password2")}),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["user", "city", "province"]
    search_fields = ["user__phone", "city"]


@admin.register(OtpCode)
class OtpCodeAdmin(admin.ModelAdmin):
    list_display = ["phone", "code", "created_at", "is_used"]
    list_filter = ["is_used"]
    search_fields = ["phone"]
    readonly_fields = ["created_at"]

# Register your models here.
