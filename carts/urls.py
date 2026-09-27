from django.urls import path
from .views import CartView, CartItemsView, CartItemView, ShippingCitiesView, ShippingProvincesView
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/', CartItemsView.as_view(), name='cart-items'),
    path('cart/items/<int:pk>/', CartItemView.as_view(), name='cart-item'),
    path('shipping/provinces/', ShippingProvincesView.as_view(), name='shipping-provinces'),
    path('shipping/cities/', ShippingCitiesView.as_view(), name='shipping-cities'),
]
