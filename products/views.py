from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]

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
