from django.db import models

# Create your models here.
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class Review(models.Model):
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1, message="امتیاز باید حداقل ۱ باشد"),
            MaxValueValidator(5, message="امتیاز باید حداکثر ۵ باشد")
        ]
    )
    text = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')  # هر کاربر فقط یک نظر برای هر محصول
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.product} ({self.rating}⭐)"