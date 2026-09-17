from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_name', 'user_phone', 'rating', 'text', 'is_approved', 'created_at']
        read_only_fields = ['id', 'user', 'is_approved', 'created_at', 'user_name', 'user_phone']


class ReviewCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'text']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("امتیاز باید بین ۱ تا ۵ باشد")
        return value