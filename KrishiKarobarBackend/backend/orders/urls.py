from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartView, CartItemViewSet, OrderViewSet, OrderItemViewSet

router = DefaultRouter()
router.register(r'cart/items', CartItemViewSet, basename='cartitem')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'farmer-order-items', OrderItemViewSet, basename='farmer-order-item')

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('', include(router.urls)),
] 