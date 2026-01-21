from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSetFarmer, ProductReviewViewSet, ProductBrowseViewSet, SubcategoryListView, FarmerAnalyticsView

router = DefaultRouter()
router.register(r'products', ProductViewSetFarmer, basename='product')
router.register(r'browse-products', ProductBrowseViewSet, basename='browse-product')
router.register(r'product-reviews', ProductReviewViewSet, basename='productreview')

urlpatterns = [
    path('browse-products/subcategories/', SubcategoryListView.as_view(), name='subcategory-list'),
    path('farmer-analytics/', FarmerAnalyticsView.as_view(), name='farmer-analytics'),
    path('', include(router.urls)),
] 