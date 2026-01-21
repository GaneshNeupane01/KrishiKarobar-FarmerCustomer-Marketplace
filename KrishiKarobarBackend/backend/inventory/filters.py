import django_filters
from .models import InventoryProduct

class InventoryProductFilter(django_filters.FilterSet):
    price__gte = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price__lte = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    rating__gte = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    stock__gt = django_filters.NumberFilter(field_name='stock', lookup_expr='gt')
    stock__lt = django_filters.NumberFilter(field_name='stock', lookup_expr='lt')

    class Meta:
        model = InventoryProduct
        fields = [
            'category', 'subcategory', 'status', 'badge',
            'price', 'price__gte', 'price__lte',
            'rating', 'rating__gte',
            'stock', 'stock__gt', 'stock__lt',
        ] 