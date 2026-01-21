from django.urls import path
from .views import InventoryProductListView, InventoryProductDetailView, InventorySubcategoryListView, InventoryReviewListCreateView, InventoryReviewDetailView, InventoryReviewLikeView, InventoryReviewRatingDistributionView

urlpatterns = [
    path('api/inventory/', InventoryProductListView.as_view(), name='inventory-list'),
    path('api/inventory/<int:pk>/', InventoryProductDetailView.as_view(), name='inventory-detail'),
    path('api/inventory/subcategories/', InventorySubcategoryListView.as_view(), name='inventory-subcategories'),
    path('api/inventory-reviews/', InventoryReviewListCreateView.as_view(), name='inventory-review-list-create'),
    path('api/inventory-reviews/<int:pk>/', InventoryReviewDetailView.as_view(), name='inventory-review-detail'),
    path('api/inventory-reviews/<int:pk>/<str:action>/', InventoryReviewLikeView.as_view(), name='inventory-review-like'),
    path('api/inventory-reviews/rating_distribution/', InventoryReviewRatingDistributionView.as_view(), name='inventory-review-rating-distribution'),
] 