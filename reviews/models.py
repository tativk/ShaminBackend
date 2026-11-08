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

class BlogPost(models.Model):
    slug = models.SlugField(max_length=140, unique=True, allow_unicode=True)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True)
    date = models.CharField(max_length=40, blank=True)
    reading_time = models.CharField(max_length=60, blank=True)
    author = models.CharField(max_length=120, blank=True)
    image = models.CharField(max_length=300, blank=True)
    image_caption = models.CharField(max_length=300, blank=True)
    excerpt = models.TextField(blank=True)
    sections = models.JSONField(default=list)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'مقاله وبلاگ'
        verbose_name_plural = 'مقالات وبلاگ'
        ordering = ["-id"]

    def __str__(self):
        return self.title