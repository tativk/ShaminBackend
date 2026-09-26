from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateUpdateSerializer
from products.models import Product


def is_staff(user):
    return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReviewCreateUpdateSerializer
        return ReviewSerializer

    def get_queryset(self):
        """خواندن عمومی فقط نظرات تأییدشده؛ ادمین همه‌ی نظرها را می‌بیند"""
        if self.request.method == 'GET':
            base = Review.objects.select_related('product', 'user')
            if is_staff(self.request.user):
                return base.all()
            return base.filter(is_approved=True)
        return Review.objects.all()

    def perform_create(self, serializer):
        """کاربر لاگین شده را خودکار ثبت کن"""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """نویسنده نظر یا ادمین می‌تواند ویرایش کند"""
        review = self.get_object()
        if review.user != self.request.user and not is_staff(self.request.user):
            raise permissions.PermissionDenied("فقط نویسنده نظر می‌تواند ویرایش کند")
        serializer.save()

    def perform_destroy(self, instance):
        """نویسنده نظر یا ادمین می‌تواند حذف کند"""
        if instance.user != self.request.user and not is_staff(self.request.user):
            raise permissions.PermissionDenied("فقط نویسنده نظر می‌تواند حذف کند")
        instance.delete()

    @action(detail=True, methods=['patch'], url_path='moderate')
    def moderate(self, request, pk=None):
        """تأیید یا رد نظر توسط ادمین — PATCH {is_approved: true|false}"""
        if not is_staff(request.user):
            return Response(
                {'detail': 'فقط ادمین می‌تواند نظرها را تأیید کند.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        review = self.get_object()
        approved = request.data.get('is_approved')
        if approved is None:
            return Response({'detail': 'مقدار is_approved الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)
        review.is_approved = bool(approved)
        review.save(update_fields=['is_approved'])
        return Response(ReviewSerializer(review).data)

    @action(detail=False, methods=['get'], url_path='product/(?P<product_id>[0-9]+)')
    def product_reviews(self, request, product_id=None):
        """نظرات تأییدشده یک محصول خاص"""
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'محصول یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        reviews = Review.objects.filter(product=product, is_approved=True).select_related('user')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)