from django.contrib import admin

from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


from config.views import health
from django.views.static import serve as media_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),

    path('api/', include('accounts.urls')),
    path('api/', include('products.urls')),
    path('api/', include('carts.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('reviews.urls')),
    # سرو فایل‌های media در همه حالت‌ها — static() فقط در DEBUG=True کار می‌کند
    # و همین باعث می‌شد در نسخه آنلاین (DEBUG=False) عکس محصولات آپلودی ۴۰۴ شود
    re_path(r'^media/(?P<path>.*)$', media_serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(permission_classes=[], authentication_classes=[]), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[], authentication_classes=[]), name='swagger-ui'),
    ]

