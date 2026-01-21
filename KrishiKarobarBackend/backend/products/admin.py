from django.contrib import admin
from .models import Product, ProductReview, ReviewLike

class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'farmer', 'category', 'price', 'min_order', 'stock', 'status', 'date_added', 'date_updated')
    list_filter = ('category', 'status', 'date_added', 'date_updated')
    search_fields = ('name', 'category', 'farmer__user__username')

class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'user', 'rating', 'date', 'likes', 'dislikes')
    list_filter = ('rating', 'date')
    search_fields = ('product__name', 'user__username', 'review')

class ReviewLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'review', 'user', 'is_like', 'created_at')
    list_filter = ('is_like', 'created_at')
    search_fields = ('review__product__name', 'user__username')

admin.site.register(Product, ProductAdmin)
admin.site.register(ProductReview, ProductReviewAdmin)
admin.site.register(ReviewLike, ReviewLikeAdmin)
