from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = (
        'product', 'inventory_product', 'quantity', 'unit_price', 'total_price', 'status', 'note', 'created_at'
    )
    readonly_fields = ('unit_price', 'total_price', 'created_at')
    autocomplete_fields = ['product', 'inventory_product']
    show_change_link = True

    def has_add_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return True

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'customer_username', 'status', 'created_at', 'updated_at', 'total_price', 'shipping_address', 'note', 'item_types_summary'
    )
    list_filter = ('status', 'created_at', 'updated_at', 'items__product', 'items__inventory_product')
    search_fields = ('id', 'customer__user__username', 'items__product__name', 'items__inventory_product__name')
    inlines = [OrderItemInline]
    readonly_fields = ('total_price', 'created_at', 'updated_at')
    ordering = ('-created_at',)

    def customer_username(self, obj):
        return obj.customer.user.username
    customer_username.short_description = 'Customer'

    def item_types_summary(self, obj):
        items = obj.items.all()
        prod_count = items.filter(product__isnull=False).count()
        inv_count = items.filter(inventory_product__isnull=False).count()
        return f"Farmer: {prod_count}, Inventory: {inv_count}"
    item_types_summary.short_description = 'Item Types'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'order', 'product', 'inventory_product', 'quantity', 'unit_price', 'total_price', 'status', 'created_at', 'note'
    )
    list_filter = ('status', 'created_at', 'product', 'inventory_product')
    search_fields = ('order__id', 'product__name', 'inventory_product__name', 'order__customer__user__username')
    autocomplete_fields = ['product', 'inventory_product', 'order']
    readonly_fields = ('unit_price', 'total_price', 'created_at')
    ordering = ('-created_at',)

admin.site.register(Cart)
admin.site.register(CartItem)