from django.urls import path

from .views import (
    AdminDashboardStatsView,
    AdminOrderStatusView,
    AdminOrdersView,
    CreateOrderView,
    PaymentCallbackView,
)

urlpatterns = [
    path('orders/', CreateOrderView.as_view(), name='create-order'),
    path('orders/payment/callback/', PaymentCallbackView.as_view(), name='payment-callback'),
    path('orders/admin/', AdminOrdersView.as_view(), name='admin-orders-list'),
    path('orders/admin/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('orders/admin/<int:pk>/status/', AdminOrderStatusView.as_view(), name='admin-order-status'),
]
