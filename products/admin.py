# products/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import Brand, Product, ProductImage


# ─────────────────────────────────────────
# Brand
# ─────────────────────────────────────────

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display        = ('name', 'slug')
    search_fields       = ('name',)
    prepopulated_fields = {'slug': ('name',)}


# ─────────────────────────────────────────
# Inline: ProductImage inside Product
# ─────────────────────────────────────────

class ProductImageInline(admin.TabularInline):
    model           = ProductImage
    extra           = 1
    fields          = ('image', 'is_main', 'image_preview')
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.pk and obj.image:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:4px;" />',
                obj.image.url,
            )
        return '—'
    image_preview.short_description = 'پیش‌نمایش'


# ─────────────────────────────────────────
# Product
# ─────────────────────────────────────────

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'brand', 'category', 'gender',
        'price', 'discount_percent', 'final_price_display',
        'stock', 'is_active', 'created_at',
    )
    list_filter     = ('is_active', 'category', 'gender', 'brand')
    search_fields   = ('name', 'description', 'brand__name')
    list_editable   = ('is_active', 'stock')
    ordering        = ('-created_at',)
    readonly_fields = ('final_price_display', 'created_at')
    inlines         = [ProductImageInline]

    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('name', 'brand', 'category', 'gender', 'description'),
        }),
        ('قیمت‌گذاری', {
            'fields': ('price', 'discount_percent', 'final_price_display'),
        }),
        ('موجودی و وضعیت', {
            'fields': ('stock', 'is_active'),
        }),
        ('تاریخ ثبت', {
            'fields': ('created_at',),
        }),
    )

    @admin.display(description='قیمت نهایی (پس از تخفیف)')
    def final_price_display(self, obj):
        # Before the product is saved, price is None — return a safe placeholder
        if obj.price is None:
            return '—'
        # Delegate to the model's own final_price property (handles Decimal rounding)
        return f'{obj.final_price:,.0f} تومان'


# ─────────────────────────────────────────
# ProductImage  (standalone)
# ─────────────────────────────────────────

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display    = ('product', 'is_main', 'image_preview')
    list_filter     = ('is_main',)
    search_fields   = ('product__name',)
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:4px;" />',
                obj.image.url,
            )
        return '—'
    image_preview.short_description = 'پیش‌نمایش'
