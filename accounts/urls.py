from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .notifications import AdminNotificationsView
from .account_settings import ChangePasswordView
from .recovery import RequestPasswordResetView, VerifyPasswordResetView, ResetPasswordView

from .views import (
    AdminCustomersView,
    AddressView,
    CompleteRegistrationView,
    PasswordLoginView,
    ProfileView,
    PurchasedProductsView,
    RegisterView,
    RequestOtpView,
    StoreSettingsView,
    VerifyOtpView,
)

urlpatterns = [
    path("admin/notifications/", AdminNotificationsView.as_view()),
    path("auth/password-reset/request/", RequestPasswordResetView.as_view()),
    path("auth/password-reset/verify/", VerifyPasswordResetView.as_view()),
    path("auth/password-reset/confirm/", ResetPasswordView.as_view()),
    path("auth/change-password/", ChangePasswordView.as_view()),
    path("auth/login/", PasswordLoginView.as_view(), name="password-login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/admin/customers/", AdminCustomersView.as_view(), name="admin-customers"),
    path("auth/admin/customers/<int:pk>/", AdminCustomersView.as_view(), name="admin-customer-detail"),
    path("store/settings/", StoreSettingsView.as_view(), name="store-settings"),
    path("auth/request-otp/", RequestOtpView.as_view(), name="request-otp"),
    path("auth/verify-otp/", VerifyOtpView.as_view(), name="verify-otp"),
    path("auth/complete-registration/", CompleteRegistrationView.as_view(), name="complete-registration"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path("auth/address/", AddressView.as_view(), name="address"),
    path("auth/purchased-products/", PurchasedProductsView.as_view(), name="purchased-products"),
]
