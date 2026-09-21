from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    """دسترسی فقط برای staff یا superuser (سازگار با چک‌های دستی endpointهای ادمین)."""

    message = 'Only staff can access this endpoint.'

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))
