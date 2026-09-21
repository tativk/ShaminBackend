from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AdminProductViewSet, BrandListView, ProductViewSet

# توجه: مسیرهای admin باید قبل از products عمومی ثبت شوند
router = DefaultRouter()
router.register(r'products/admin', AdminProductViewSet, basename='admin-product')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('', include(router.urls)),
]
