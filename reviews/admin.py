from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating', 'created_at')
    search_fields = ('user__phone', 'product__name', 'text')
    readonly_fields = ('created_at', 'updated_at')

    actions = ['approve_reviews', 'disapprove_reviews']

    def approve_reviews(self, request, queryset):
        """اکشن تأیید گروهی نظرات"""
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} نظر تأیید شدند')
    
    approve_reviews.short_description = "✅ تأیید نظرات انتخاب شده"

    def disapprove_reviews(self, request, queryset):
        """اکشن عدم تأیید گروهی نظرات"""
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} نظر رد شدند')
    
    disapprove_reviews.short_description = "❌ رد نظرات انتخاب شده"