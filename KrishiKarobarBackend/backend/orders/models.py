from django.db import models
from django.conf import settings
from backend.products.models import Product
from backend.users.models import CustomerProfile, FarmerProfile
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from backend.inventory.models import InventoryProduct

# Create your models here.

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

    def get_total_price(self):
        return sum(item.get_total_price() for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    inventory_product = models.ForeignKey(InventoryProduct, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    note = models.CharField(max_length=255, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        if (self.product and self.inventory_product) or (not self.product and not self.inventory_product):
            raise ValidationError('Exactly one of product or inventory_product must be set.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.product:
            return f"{self.quantity} x {self.product.name} in {self.cart.user.username}'s cart"
        elif self.inventory_product:
            return f"{self.quantity} x {self.inventory_product.name} in {self.cart.user.username}'s cart"
        return f"{self.quantity} x Unknown Product in {self.cart.user.username}'s cart"

    def get_total_price(self):
        if self.product:
            return self.product.price * self.quantity
        elif self.inventory_product:
            return self.inventory_product.price * self.quantity
        return 0

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_address = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"Order #{self.id} by {self.customer.user.username} ({self.status})"

    def get_total_price(self):
        return sum(item.total_price for item in self.items.all())

    def aggregate_status(self):
        items = list(self.items.all())
        if not items:
            self.status = 'pending'
            self.save(update_fields=['status'])
            return
        statuses = set(item.status for item in items)
        if all(s == 'cancelled' for s in statuses):
            self.status = 'cancelled'
        elif all(s == 'delivered' for s in statuses):
            self.status = 'delivered'
        elif all(s == 'shipped' for s in statuses):
            self.status = 'shipped'
        elif all(s == 'accepted' for s in statuses):
            self.status = 'accepted'
        elif any(s == 'pending' for s in statuses):
            self.status = 'pending'
        else:
            # Mixed statuses, prioritize in order: delivered > shipped > accepted > pending > cancelled
            if 'delivered' in statuses:
                self.status = 'delivered'
            elif 'shipped' in statuses:
                self.status = 'shipped'
            elif 'accepted' in statuses:
                self.status = 'accepted'
            elif 'pending' in statuses:
                self.status = 'pending'
            elif 'cancelled' in statuses:
                self.status = 'cancelled'
        self.save(update_fields=['status'])

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    inventory_product = models.ForeignKey(InventoryProduct, on_delete=models.PROTECT, null=True, blank=True)
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.PROTECT, related_name='order_items', null=True, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES, default='pending')
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        if (self.product and self.inventory_product) or (not self.product and not self.inventory_product):
            raise ValidationError('Exactly one of product or inventory_product must be set.')
        if self.product and not self.farmer:
            raise ValidationError('Farmer must be set for regular products.')
        if self.inventory_product and self.farmer:
            raise ValidationError('Farmer must not be set for inventory products.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.product:
            return f"{self.quantity} x {self.product.name} for Order #{self.order.id}"
        elif self.inventory_product:
            return f"{self.quantity} x {self.inventory_product.name} for Order #{self.order.id}"
        return f"{self.quantity} x Unknown Product for Order #{self.order.id}"

@receiver(post_save, sender=OrderItem)
def update_order_status_on_save(sender, instance, **kwargs):
    instance.order.aggregate_status()

@receiver(post_delete, sender=OrderItem)
def update_order_status_on_delete(sender, instance, **kwargs):
    instance.order.aggregate_status()
