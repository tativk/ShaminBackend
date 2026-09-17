from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateUpdateSerializer
from products.models import Product


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReviewCreateUpdateSerializer
        return ReviewSerializer

    def get_queryset(self):
        """اگر خواندن باشد، فقط نظرات تأیید شده را برگردان"""
        if self.request.method == 'GET':
            return Review.objects.filter(is_approved=True)
        return Review.objects.all()

    def perform_create(self, serializer):
        """کاربر لاگین شده را خودکار ثبت کن"""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """فقط نویسنده نظر می‌تواند ویرایش کند"""
        review = self.get_object()
        if review.user != self.request.user:
            raise permissions.PermissionDenied("فقط نویسنده نظر می‌تواند ویرایش کند")
        serializer.save()

    def perform_destroy(self, instance):
        """فقط نویسنده نظر می‌تواند حذف کند"""
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("فقط نویسنده نظر می‌تواند حذف کند")
        instance.delete()

    @action(detail=False, methods=['get'], url_path='product/(?P<product_id>[0-9]+)')
    def product_reviews(self, request, product_id=None):
        """نظرات یک محصول خاص"""
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'محصول یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        
        reviews = Review.objects.filter(product=product, is_approved=True)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)