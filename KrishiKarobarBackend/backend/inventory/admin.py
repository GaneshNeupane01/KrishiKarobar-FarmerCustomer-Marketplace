from django.contrib import admin
from .models import InventoryProduct

@admin.register(InventoryProduct)
class InventoryProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'subcategory', 'price', 'stock', 'status', 'date_added', 'date_updated')
    list_filter = ('category', 'subcategory', 'status', 'date_added')
    search_fields = ('name', 'category', 'subcategory', 'description')
    ordering = ('-date_added',)
