from django.contrib import admin

from .models import ShippingRate


@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ['city', 'cost']
    search_fields = ['city']
