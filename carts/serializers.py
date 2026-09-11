from rest_framework import serializers

from .models import Cart, CartItem, ShippingRate


class ShippingRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRate
        fields = ['id', 'city', 'cost']


class CartItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='product.name', read_only=True)
    unit_price = serializers.DecimalField(source='product.final_price', max_digits=14, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=24, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'name', 'quantity', 'unit_price', 'line_total']


class CartSerializer(serializers.ModelSerializer):
    city = serializers.SlugRelatedField(slug_field='city', read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=30, decimal_places=2, read_only=True)
    shipping_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, allow_null=True)
    total = serializers.DecimalField(max_digits=30, decimal_places=2, read_only=True, allow_null=True)

    class Meta:
        model = Cart
        fields = ['id', 'city', 'items', 'subtotal', 'shipping_cost', 'total']


class CartCitySerializer(serializers.Serializer):
    city = serializers.SlugRelatedField(slug_field='city', queryset=ShippingRate.objects.all())


class QuantitySerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=2147483647)


class AddItemSerializer(QuantitySerializer):
    product = serializers.IntegerField(min_value=1)
