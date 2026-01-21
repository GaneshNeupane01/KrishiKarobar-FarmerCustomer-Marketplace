from rest_framework import serializers
from .models import InventoryProduct, InventoryReview, InventoryReviewLike
from django.utils import timezone
from django.contrib.auth.models import User

class InventoryProductSerializer(serializers.ModelSerializer):
    badge = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

    def get_badge(self, obj):
        if obj.featured:
            return "Featured"
        if obj.date_added and (timezone.now() - obj.date_added).days < 7:
            return "Newly Added"
        return ""

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request', None)
        if instance.image:
            if request:
                rep['image'] = request.build_absolute_uri(instance.image.url)
            else:
                rep['image'] = instance.image.url
        else:
            rep['image'] = None
        return rep

    class Meta:
        model = InventoryProduct
        fields = '__all__'

class InventoryReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    likes = serializers.IntegerField(read_only=True)
    dislikes = serializers.IntegerField(read_only=True)
    user_liked = serializers.SerializerMethodField()
    user_disliked = serializers.SerializerMethodField()
    user_profile_image = serializers.SerializerMethodField()

    class Meta:
        model = InventoryReview
        fields = ['id', 'product', 'user', 'first_name', 'last_name', 'user_profile_image', 'rating', 'review', 'image', 'date', 'likes', 'dislikes', 'user_liked', 'user_disliked']
        read_only_fields = ['id', 'user', 'first_name', 'last_name', 'user_profile_image', 'date', 'likes', 'dislikes', 'user_liked', 'user_disliked']

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

    def get_user_liked(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        return obj.user_likes.filter(user=user, is_like=True).exists()

    def get_user_disliked(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        return obj.user_likes.filter(user=user, is_like=False).exists()

    def get_user_profile_image(self, obj):
        try:
            if hasattr(obj.user, 'customerprofile') and obj.user.customerprofile.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.user.customerprofile.profile_picture.url)
                return obj.user.customerprofile.profile_picture.url
        except Exception:
            pass
        return None

class InventoryReviewLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryReviewLike
        fields = ['id', 'review', 'user', 'is_like', 'created_at']
        read_only_fields = ['id', 'user', 'created_at'] 