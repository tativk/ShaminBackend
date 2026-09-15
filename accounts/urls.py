from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AddressView,
    CompleteRegistrationView,
    ProfileView,
    PurchasedProductsView,
    RequestOtpView,
    VerifyOtpView,
)

urlpatterns = [
    path("auth/request-otp/", RequestOtpView.as_view(), name="request-otp"),
    path("auth/verify-otp/", VerifyOtpView.as_view(), name="verify-otp"),
    path("auth/complete-registration/", CompleteRegistrationView.as_view(), name="complete-registration"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path("auth/address/", AddressView.as_view(), name="address"),
    path("auth/purchased-products/", PurchasedProductsView.as_view(), name="purchased-products"),
]
