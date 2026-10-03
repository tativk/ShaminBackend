from django.contrib import admin

from .models import Coupon, ShippingRate


@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ['city', 'cost']
    search_fields = ['city']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_percent', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['code']
