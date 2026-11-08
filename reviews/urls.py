from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, AdminBlogView, AdminBlogDetailView, PublicBlogView, PublicBlogDetailView, BlogImageUploadView

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
urlpatterns += [
    path('blog/', PublicBlogView.as_view(), name='public-blog'),
    path('blog/<str:slug>/', PublicBlogDetailView.as_view(), name='public-blog-detail'),
    path('blog-admin/', AdminBlogView.as_view(), name='admin-blog'),
    path('blog-admin/<str:slug>/', AdminBlogDetailView.as_view(), name='admin-blog-detail'),
    path('blog-admin/upload/', BlogImageUploadView.as_view(), name='admin-blog-upload'),
]