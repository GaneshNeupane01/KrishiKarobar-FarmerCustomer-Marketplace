from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from backend.products.models import Product
from backend.products.serializers import ProductSerializer
from backend.users.models import FarmerProfile, CustomerProfile
from backend.notifications.models import Notification
from backend.inventory.models import InventoryProduct
from backend.inventory.serializers import InventoryProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    inventory_product = serializers.SerializerMethodField()
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True, required=False)
    inventory_product_id = serializers.PrimaryKeyRelatedField(queryset=InventoryProduct.objects.all(), source='inventory_product', write_only=True, required=False)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'inventory_product', 'inventory_product_id', 'quantity', 'note', 'total_price']

    def get_product(self, obj):
        if obj.product:
            return ProductSerializer(obj.product, context=self.context).data
        return None

    def get_inventory_product(self, obj):
        if obj.inventory_product:
            return InventoryProductSerializer(obj.inventory_product, context=self.context).data
        return None

    def get_total_price(self, obj):
        return obj.get_total_price()

    def validate(self, data):
        if (data.get('product') and data.get('inventory_product')) or (not data.get('product') and not data.get('inventory_product')):
            raise serializers.ValidationError('Exactly one of product or inventory_product must be set.')
        return data

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price']
        read_only_fields = ['id', 'user', 'items', 'total_price']

    def get_total_price(self, obj):
        return obj.get_total_price()

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    inventory_product = InventoryProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True, required=False)
    inventory_product_id = serializers.PrimaryKeyRelatedField(queryset=InventoryProduct.objects.all(), source='inventory_product', write_only=True, required=False)
    farmer = serializers.StringRelatedField(read_only=True)
    farmer_id = serializers.PrimaryKeyRelatedField(queryset=FarmerProfile.objects.all(), source='farmer', write_only=True, required=False)
    customer = serializers.SerializerMethodField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    order_status = serializers.SerializerMethodField(read_only=True)
    farmer_details = serializers.SerializerMethodField(read_only=True)

    def get_customer(self, obj):
        customer = obj.order.customer
        return {
            'username': customer.user.username,
            'email': customer.user.email,
            'phone': customer.phone,
            'address': customer.address,
        }

    def get_order_status(self, obj):
        return obj.order.status

    def get_farmer_details(self, obj):
        farmer = obj.farmer
        request = self.context.get('request')
        profile_picture_url = None
        if farmer and farmer.profile_picture:
            if request is not None:
                profile_picture_url = request.build_absolute_uri(farmer.profile_picture.url)
            else:
                profile_picture_url = farmer.profile_picture.url
        return {
            'username': farmer.user.username if farmer else None,
            'full_name': f"{farmer.user.first_name} {farmer.user.last_name}".strip() if farmer else None,
            'phone': farmer.phone if farmer else None,
            'address': farmer.address if farmer else None,
            'farm_name': farmer.farm_name if farmer else None,
            'profile_picture': profile_picture_url,
            'province': farmer.province if farmer else None,
        } if farmer else None

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_id', 'inventory_product', 'inventory_product_id', 'farmer', 'farmer_id', 'quantity', 'unit_price', 'total_price', 'status', 'note', 'created_at', 'customer', 'order_status', 'farmer_details'
        ]
        read_only_fields = ['id', 'product', 'inventory_product', 'farmer', 'unit_price', 'total_price', 'status', 'created_at', 'customer', 'order_status', 'farmer_details']

    def validate(self, data):
        if (data.get('product') and data.get('inventory_product')) or (not data.get('product') and not data.get('inventory_product')):
            raise serializers.ValidationError('Exactly one of product or inventory_product must be set.')
        if data.get('product') and not data.get('farmer'):
            raise serializers.ValidationError('Farmer must be set for regular products.')
        if data.get('inventory_product') and data.get('farmer'):
            raise serializers.ValidationError('Farmer must not be set for inventory products.')
        return data

class OrderSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(queryset=CustomerProfile.objects.all(), source='customer', write_only=True, required=False)
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_id', 'status', 'created_at', 'updated_at', 'total_price', 'shipping_address', 'note', 'items'
        ]
        read_only_fields = ['id', 'customer', 'created_at', 'updated_at', 'total_price']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        total = 0
        for item_data in items_data:
            if item_data.get('product'):
                product = item_data['product']
                farmer = item_data['farmer']
                quantity = item_data['quantity']
                unit_price = product.price
                total_price = unit_price * quantity
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    farmer=farmer,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=total_price,
                    note=item_data.get('note', '')
                )
                total += total_price
            elif item_data.get('inventory_product'):
                inventory_product = item_data['inventory_product']
                quantity = item_data['quantity']
                unit_price = inventory_product.price
                total_price = unit_price * quantity
                OrderItem.objects.create(
                    order=order,
                    inventory_product=inventory_product,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=total_price,
                    note=item_data.get('note', '')
                )
                total += total_price
        order.total_price = total
        order.save()
        return order 