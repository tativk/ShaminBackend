from django.contrib import admin
<<<<<<< HEAD
from django.urls import include, path
=======
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
>>>>>>> 75f3dc18771b7adddcc10c7c0047f28bc97744e2

from config.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),
<<<<<<< HEAD
    path('api/', include('accounts.urls')),
]
=======
    path('api/products/', include('products.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
>>>>>>> 75f3dc18771b7adddcc10c7c0047f28bc97744e2
