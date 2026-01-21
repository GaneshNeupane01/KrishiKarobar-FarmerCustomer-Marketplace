from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem, Order, OrderItem
from backend.products.models import Product
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import serializers
from backend.users.models import CustomerProfile, FarmerProfile
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from backend.inventory.models import InventoryProduct

# Create your views here.

# Placeholder for CartItemViewSet and CartView

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)

    def create(self, request, *args, **kwargs):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        inventory_product_id = request.data.get('inventory_product_id')
        quantity = int(request.data.get('quantity', 1))
        if product_id and inventory_product_id:
            return Response({'detail': 'Cannot add both product and inventory_product.'}, status=status.HTTP_400_BAD_REQUEST)
        if not product_id and not inventory_product_id:
            return Response({'detail': 'Must provide either product_id or inventory_product_id.'}, status=status.HTTP_400_BAD_REQUEST)
        if product_id:
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response({'detail': 'Product not found.'}, status=status.HTTP_400_BAD_REQUEST)
            min_order = product.min_order or 1
            if quantity < min_order:
                quantity = min_order
            existing_item = CartItem.objects.filter(cart=cart, product=product).first()
            stock = product.stock
            if existing_item:
                new_quantity = existing_item.quantity + quantity
                if new_quantity > stock:
                    return Response({'detail': f'Cannot add more than available stock ({stock}).'}, status=status.HTTP_400_BAD_REQUEST)
                existing_item.quantity = new_quantity
                existing_item.save()
                serializer = self.get_serializer(existing_item)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                if quantity > stock:
                    return Response({'detail': f'Cannot add more than available stock ({stock}).'}, status=status.HTTP_400_BAD_REQUEST)
                serializer = self.get_serializer(data={**request.data, 'cart': cart.id, 'quantity': quantity})
                serializer.is_valid(raise_exception=True)
                serializer.save(cart=cart, quantity=quantity, product=product)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        elif inventory_product_id:
            try:
                inventory_product = InventoryProduct.objects.get(id=inventory_product_id)
            except InventoryProduct.DoesNotExist:
                return Response({'detail': 'Inventory product not found.'}, status=status.HTTP_400_BAD_REQUEST)
            min_order = inventory_product.min_order or 1
            if quantity < min_order:
                quantity = min_order
            existing_item = CartItem.objects.filter(cart=cart, inventory_product=inventory_product).first()
            stock = inventory_product.stock
            if existing_item:
                new_quantity = existing_item.quantity + quantity
                if new_quantity > stock:
                    return Response({'detail': f'Cannot add more than available stock ({stock}).'}, status=status.HTTP_400_BAD_REQUEST)
                existing_item.quantity = new_quantity
                existing_item.save()
                serializer = self.get_serializer(existing_item)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                if quantity > stock:
                    return Response({'detail': f'Cannot add more than available stock ({stock}).'}, status=status.HTTP_400_BAD_REQUEST)
                serializer = self.get_serializer(data={**request.data, 'cart': cart.id, 'quantity': quantity})
                serializer.is_valid(raise_exception=True)
                serializer.save(cart=cart, quantity=quantity, inventory_product=inventory_product)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data.get('product')
        inventory_product = serializer.validated_data.get('inventory_product')
        quantity = serializer.validated_data['quantity']
        if product:
            existing_item = CartItem.objects.filter(cart=cart, product=product).first()
            stock = product.stock
            if existing_item:
                new_quantity = existing_item.quantity + quantity
                if new_quantity > stock:
                    raise serializers.ValidationError({'quantity': f'Cannot add more than available stock ({stock}).'})
                existing_item.quantity = new_quantity
                existing_item.save()
                self.instance = existing_item
            else:
                if quantity > stock:
                    raise serializers.ValidationError({'quantity': f'Cannot add more than available stock ({stock}).'})
                serializer.save(cart=cart)
        elif inventory_product:
            existing_item = CartItem.objects.filter(cart=cart, inventory_product=inventory_product).first()
            stock = inventory_product.stock
            if existing_item:
                new_quantity = existing_item.quantity + quantity
                if new_quantity > stock:
                    raise serializers.ValidationError({'quantity': f'Cannot add more than available stock ({stock}).'})
                existing_item.quantity = new_quantity
                existing_item.save()
                self.instance = existing_item
            else:
                if quantity > stock:
                    raise serializers.ValidationError({'quantity': f'Cannot add more than available stock ({stock}).'})
                serializer.save(cart=cart)

    def perform_update(self, serializer):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        serializer.save(cart=cart)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.cart.user != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'customerprofile')

class IsFarmer(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'farmerprofile')

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        user = self.request.user
        queryset = None
        if user.is_staff:
            queryset = Order.objects.all()
        elif hasattr(user, 'customerprofile'):
            queryset = Order.objects.filter(customer=user.customerprofile)
        else:
            return Order.objects.none()
        queryset = queryset.order_by('-created_at')
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        return queryset

    def perform_create(self, serializer):
        print('PERFORM_CREATE CALLED')
        user = self.request.user
        if not hasattr(user, 'customerprofile'):
            raise PermissionDenied('Only customers can create orders.')
        order = serializer.save(customer=user.customerprofile)
        # Notification logic here
        from backend.notifications.models import Notification
        farmers_notified = set()
        for item in order.items.all():
            farmer = item.farmer
            product = item.product
            # Only notify farmer if this is a farmer product
            if farmer and product and farmer.user_id not in farmers_notified:
                Notification.objects.create(
                    recipient=farmer.user,
                    type='order',
                    text=f'New order received for {product.name}',
                    link=None
                )
                farmers_notified.add(farmer.user_id)
        Notification.objects.create(
            recipient=order.customer.user,
            type='order',
            text=f'Your order #{order.id} has been placed',
            link=None
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        # Only allow customer to cancel their own order if all items are still pending
        if 'status' in request.data and request.data['status'] == 'cancelled':
            if hasattr(user, 'customerprofile') and instance.customer == user.customerprofile:
                if all(item.status == 'pending' for item in instance.items.all()):
                    instance.status = 'cancelled'
                    instance.save()
                    serializer = self.get_serializer(instance)
                    return Response(serializer.data)
                else:
                    return Response({'detail': 'Cannot cancel order that has already been accepted or shipped.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['product__name', 'order__customer__user__first_name', 'order__customer__user__last_name']
    ordering_fields = ['created_at', 'total_price']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OrderItem.objects.all()
        if hasattr(user, 'farmerprofile'):
            return OrderItem.objects.filter(farmer=user.farmerprofile)
        return OrderItem.objects.none()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        # Prevent status change if parent order is cancelled
        if instance.order.status == 'cancelled':
            return Response({'detail': 'Cannot update order item because the order has been cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        # Only allow farmer to update status of their own order items
        if hasattr(user, 'farmerprofile') and instance.farmer == user.farmerprofile:
            allowed_statuses = [s[0] for s in Order.STATUS_CHOICES]
            new_status = request.data.get('status')
            if new_status == 'accepted':
                # Check stock
                if instance.product.stock < instance.quantity:
                    return Response({'detail': 'Not enough stock to accept this order.'}, status=status.HTTP_400_BAD_REQUEST)
                # Decrement stock
                instance.product.stock -= instance.quantity
                instance.product.save()
                # Low stock notification
                if instance.product.stock < 5:
                    from backend.notifications.models import Notification
                    Notification.objects.create(
                        recipient=instance.farmer.user,
                        type='stock',
                        text=f'Low stock alert: {instance.product.name} has only {instance.product.stock} left',
                        link=None
                    )
            if new_status in allowed_statuses:
                old_status = instance.status
                instance.status = new_status
                instance.save()
                # Notification triggers for status change
                from backend.notifications.models import Notification
                # Notify customer
                Notification.objects.create(
                    recipient=instance.order.customer.user,
                    type='order_status',
                    text=f'Your order for {instance.product.name} is now {new_status}',
                    link=None
                )
                # Notify farmer
                Notification.objects.create(
                    recipient=instance.farmer.user,
                    type='order_status',
                    text=f'Order for {instance.product.name} is now {new_status}',
                    link=None
                )
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
            else:
                return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if hasattr(user, 'farmerprofile') and instance.farmer == user.farmerprofile:
            return super().destroy(request, *args, **kwargs)
        return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
