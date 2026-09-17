from django.urls import path

from .views import CreateOrderView, PaymentCallbackView

urlpatterns = [
    path('orders/', CreateOrderView.as_view(), name='create-order'),
    path('orders/payment/callback/', PaymentCallbackView.as_view(), name='payment-callback'),
]
