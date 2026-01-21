from rest_framework import serializers
from .models import Product, ProductReview, ReviewLike
from django.contrib.auth.models import User
import django_filters
from backend.users.models import FarmerProfile

class ProductReviewSerializer(serializers.ModelSerializer):
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
        model = ProductReview
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
        # Try to get customer profile image
        try:
            if hasattr(obj.user, 'customerprofile') and obj.user.customerprofile.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.user.customerprofile.profile_picture.url)
                return obj.user.customerprofile.profile_picture.url
        except Exception as e:
            print(f"Error getting profile image: {e}")
        return None

class FarmerProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    user = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name
        }
    
    class Meta:
        model = FarmerProfile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone', 'province', 'address', 'farm_name', 'farm_size',
            'farming_experience', 'crop_types', 'profile_picture', 'user'
        ]

class ProductSerializer(serializers.ModelSerializer):
    farmer = FarmerProfileSerializer(read_only=True)
    farmer_username = serializers.SerializerMethodField()
    reviews = ProductReviewSerializer(many=True, read_only=True)
    badge = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

    def get_farmer_username(self, obj):
        return obj.farmer.user.username

    def get_badge(self, obj):
        from django.utils import timezone
        if getattr(obj, "featured", False):
            return "Featured"
        if obj.date_added and (timezone.now() - obj.date_added).days < 7:
            return "Newly Added"
        return ""

    def get_in_stock(self, obj):
        return obj.stock > 0 and obj.status == 'Active'

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
        model = Product
        fields = [
            'id', 'farmer', 'farmer_username', 'name', 'category', 'subcategory', 'image', 'price', 'min_order', 'unit',
            'province', 'product_address', 'description', 'stock', 'status', 'date_added', 'date_updated',
            'rating', 'review_count', 'reviews', 'badge', 'in_stock'
        ]
        read_only_fields = ['id', 'farmer', 'farmer_username', 'date_added', 'date_updated', 'rating', 'review_count', 'reviews', 'badge', 'in_stock']

class ProductFilter(django_filters.rest_framework.FilterSet):
    farmer_username = django_filters.CharFilter(field_name='farmer__user__username', lookup_expr='iexact')
    badge = django_filters.CharFilter(method='filter_badge')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    price__gte = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price__lte = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    def filter_badge(self, queryset, name, value):
        # Filtering by derived badges
        if value == 'Featured':
            return queryset.filter(stock__gt=0, status='Active')
        elif value == 'Top Selling':
            return queryset.filter(rating__gte=4.5)
        elif value == 'Newly Added':
            from django.utils import timezone
            from datetime import timedelta
            week_ago = timezone.now() - timedelta(days=7)
            return queryset.filter(date_added__gte=week_ago)
        # Add more badge logic as needed
        return queryset.none()

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0, status='Active')
        return queryset

    class Meta:
        model = Product
        fields = ['category', 'subcategory', 'status', 'province', 'price', 'min_order', 'unit', 'date_added', 'farmer', 'farmer_username', 'badge', 'in_stock']

class ReviewLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewLike
        fields = ['id', 'review', 'user', 'is_like', 'created_at']
        read_only_fields = ['id', 'user', 'created_at'] 