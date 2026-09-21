from django.db.models import ProtectedError
from rest_framework import permissions, status, viewsets
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from config.permissions import IsStaffUser

from .models import Brand, Product
from .serializers import (
    AdminProductSerializer,
    BrandSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('brand').prefetch_related('images')

        category = self.request.query_params.get('category')
        brand = self.request.query_params.get('brand')
        gender = self.request.query_params.get('gender')

        if category:
            queryset = queryset.filter(category=category)
        if brand:
            queryset = queryset.filter(brand__id=brand)
        if gender:
            queryset = queryset.filter(gender=gender)

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer


class AdminProductViewSet(viewsets.ModelViewSet):
    """CRUD کامل محصولات برای پنل ادمین (شامل محصولات غیرفعال)."""
    permission_classes = [IsStaffUser]
    serializer_class = AdminProductSerializer
    queryset = Product.objects.all().select_related('brand').prefetch_related('images')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {'detail': 'این محصول در سفارش‌ها استفاده شده و قابل حذف نیست؛ می‌توانید آن را غیرفعال کنید.'},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class BrandListView(ListAPIView):
    """فهرست برندها برای فرم محصولات (و فیلتر فروشگاه)."""
    permission_classes = [permissions.AllowAny]
    serializer_class = BrandSerializer
    queryset = Brand.objects.all().order_by('name')
