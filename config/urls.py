from django.contrib import admin

from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


from config.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),

    path('api/', include('accounts.urls')),
    path('api/', include('products.urls')),
    path('api/', include('carts.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(permission_classes=[], authentication_classes=[]), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[], authentication_classes=[]), name='swagger-ui'),
    ]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
    path('api/', include('accounts.urls')),
    path('api/', include('carts.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('reviews.urls')),  # ← اضافه کن
]