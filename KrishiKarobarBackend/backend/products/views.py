from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters, mixins
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, ProductReview, ReviewLike
from .serializers import ProductSerializer, ProductReviewSerializer, ProductFilter, ReviewLikeSerializer
from backend.users.models import FarmerProfile, CustomerProfile
from rest_framework.views import APIView
from rest_framework.decorators import action
from backend.orders.models import Order, OrderItem
from django.db.models import Sum, Count, F, Q, Avg, ProtectedError
from datetime import timedelta
from django.utils import timezone

# Create your views here.

class IsFarmer(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'farmerprofile')

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'customerprofile')

class ProductViewSetFarmer(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'subcategory', 'description']
    ordering_fields = ['price', 'rating', 'date_added', 'stock', 'sales', 'views']
    ordering = ['-date_added']

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user.farmerprofile)

    def perform_update(self, serializer):
        # Only allow farmers to edit their own products
        product = self.get_object()
        if product.farmer != self.request.user.farmerprofile:
            raise permissions.PermissionDenied('You can only edit your own products.')
        old_stock = product.stock
        updated_product = serializer.save()
        # Notification logic for out of stock/back in stock
        from backend.notifications.models import Notification
        farmer_user = updated_product.farmer.user
        # Out of stock notification
        if old_stock > 0 and updated_product.stock == 0:
            Notification.objects.create(
                recipient=farmer_user,
                type='stock',
                text=f'Your product {updated_product.name} is now out of stock',
                link=None
            )
        # Back in stock notification
        if old_stock == 0 and updated_product.stock > 0:
            Notification.objects.create(
                recipient=farmer_user,
                type='stock',
                text=f'Your product {updated_product.name} is back in stock',
                link=None
            )

    def perform_destroy(self, instance):
        # Only allow farmers to delete their own products
        if instance.farmer != self.request.user.farmerprofile:
            raise permissions.PermissionDenied('You can only delete your own products.')
        instance.delete()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.farmer != self.request.user.farmerprofile:
            return Response({'detail': 'You can only delete your own products.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response({'detail': 'Cannot delete product: it has existing orders.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProductReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']

    def get_queryset(self):
        queryset = ProductReview.objects.all()
        product_id = self.request.query_params.get('product', None)
        farmer_username = self.request.query_params.get('farmer_username', None)
        if product_id is not None:
            queryset = queryset.filter(product_id=product_id)
        if farmer_username is not None:
            queryset = queryset.filter(product__farmer__user__username=farmer_username)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        # Only customers can create reviews
        if not hasattr(request.user, 'customerprofile'):
            return Response({'detail': 'Only customers can post reviews.'}, status=403)
        product_id = request.data.get('product')
        if not product_id:
            return Response({'detail': 'Product is required.'}, status=400)
        if ProductReview.objects.filter(product_id=product_id, user=request.user).exists():
            return Response({'detail': 'You have already reviewed this product.'}, status=400)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        # Notification for farmer when a new review is left
        from backend.notifications.models import Notification
        farmer_user = review.product.farmer.user
        Notification.objects.create(
            recipient=farmer_user,
            type='review',
            text=f'New review on your product {review.product.name}',
            link=None
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({'detail': 'You can only edit your own review.'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({'detail': 'You can only delete your own review.'}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[], authentication_classes=[])
    def rating_distribution(self, request):
        product_id = request.query_params.get('product')
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=400)
        
        reviews = ProductReview.objects.filter(product_id=product_id)
        distribution = {
            '5': reviews.filter(rating=5).count(),
            '4': reviews.filter(rating=4).count(),
            '3': reviews.filter(rating=3).count(),
            '2': reviews.filter(rating=2).count(),
            '1': reviews.filter(rating=1).count(),
        }
        total = sum(distribution.values())
        
        if total > 0:
            percentages = {k: (v / total) * 100 for k, v in distribution.items()}
        else:
            percentages = {k: 0 for k in distribution.keys()}
        
        return Response({
            'distribution': distribution,
            'percentages': percentages,
            'total': total
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        try:
            review = self.get_object(); user = request.user
            # Check if ReviewLike exists, if not create it
            try:
                like_obj = ReviewLike.objects.get(review=review, user=user)
                like_obj.is_like = True
                like_obj.save()
            except ReviewLike.DoesNotExist:
                like_obj = ReviewLike.objects.create(review=review, user=user, is_like=True)
            # Update review counts
            review.likes = ReviewLike.objects.filter(review=review, is_like=True).count()
            review.dislikes = ReviewLike.objects.filter(review=review, is_like=False).count()
            review.save()
            # Notification for review like
            if review.user != user:
                from backend.notifications.models import Notification
                Notification.objects.create(
                    recipient=review.user,
                    type='review',
                    text=f'Your review on {review.product.name} was liked by {user.username}',
                    link=None
                )
            return Response({
                'likes': review.likes, 
                'dislikes': review.dislikes, 
                'user_liked': True, 
                'user_disliked': False
            })
        except Exception as e:
            print(f"Like error: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def dislike(self, request, pk=None):
        try:
            review = self.get_object(); user = request.user
            # Check if ReviewLike exists, if not create it
            try:
                like_obj = ReviewLike.objects.get(review=review, user=user)
                like_obj.is_like = False
                like_obj.save()
            except ReviewLike.DoesNotExist:
                like_obj = ReviewLike.objects.create(review=review, user=user, is_like=False)
            # Update review counts
            review.likes = ReviewLike.objects.filter(review=review, is_like=True).count()
            review.dislikes = ReviewLike.objects.filter(review=review, is_like=False).count()
            review.save()
            # Notification for review dislike
            if review.user != user:
                from backend.notifications.models import Notification
                Notification.objects.create(
                    recipient=review.user,
                    type='review',
                    text=f'Your review on {review.product.name} was disliked by {user.username}',
                    link=None
                )
            return Response({
                'likes': review.likes, 
                'dislikes': review.dislikes, 
                'user_liked': False, 
                'user_disliked': True
            })
        except Exception as e:
            print(f"Dislike error: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unlike(self, request, pk=None):
        try:
            review = self.get_object()
            user = request.user
            
            # Delete the like/dislike
            ReviewLike.objects.filter(review=review, user=user).delete()
            
            # Update review counts
            review.likes = ReviewLike.objects.filter(review=review, is_like=True).count()
            review.dislikes = ReviewLike.objects.filter(review=review, is_like=False).count()
            review.save()
            
            return Response({
                'likes': review.likes, 
                'dislikes': review.dislikes, 
                'user_liked': False, 
                'user_disliked': False
            })
        except Exception as e:
            print(f"Unlike error: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class ProductBrowseViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    filterset_fields = ['category', 'status', 'province', 'price', 'price__gte', 'price__lte', 'in_stock']
    search_fields = ['name', 'subcategory', 'description', 'province', 'category','farmer__user__first_name','farmer__user__last_name']
    ordering_fields = ['price', 'rating', 'date_added', 'stock', 'sales', 'views']
    ordering = ['-date_added']
    permission_classes = []  # Public access

    @action(detail=True, methods=['get'], url_path='similar')
    def similar_products(self, request, pk=None):
        try:
            product = self.get_object()
            # Find similar products by category and subcategory, exclude self
            queryset = Product.objects.filter(category=product.category)
            if product.subcategory:
                queryset = queryset.filter(subcategory=product.subcategory)
            queryset = queryset.exclude(pk=product.pk)
            # If not enough, fallback to just category
            similar = list(queryset.order_by('-rating', '-date_added')[:4])
            if len(similar) < 4:
                # Fill up with more from category (excluding already selected and self)
                extra_needed = 4 - len(similar)
                extra = Product.objects.filter(category=product.category).exclude(pk__in=[p.pk for p in similar] + [product.pk]).order_by('-rating', '-date_added')[:extra_needed]
                similar += list(extra)
            serializer = self.get_serializer(similar, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class SubcategoryListView(APIView):
    def get(self, request):
        category = request.query_params.get('category')
        if not category:
            return Response({'error': 'category param required'}, status=400)
        from .models import Product
        subcategories = Product.objects.filter(category=category).values_list('subcategory', flat=True).distinct()
        return Response({'subcategories': list(subcategories)})

class FarmerAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsFarmer]

    def get(self, request):
        farmer = request.user.farmerprofile
        now = timezone.now()
        # 1. Total Orders (number of accepted/shipped/delivered order items)
        total_orders = OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered']).count()
        # 2. Total Sales Quantity (sum of quantities sold)
        total_sales_quantity = OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered']).aggregate(total=Sum('quantity'))['total'] or 0
        # 3. Total Revenue
        total_revenue = OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered']).aggregate(total=Sum('total_price'))['total'] or 0
        # 4. Best Seller (product with most quantity sold)
        best_seller = (
            OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered'])
            .values('product__name')
            .annotate(qty=Sum('quantity'))
            .order_by('-qty')
            .first()
        )
        # 5. Active Listings (products in stock)
        active_listings = farmer.products.filter(stock__gt=0).count()
        # 6. Customer Count (unique customers)
        customer_count = (
            OrderItem.objects.filter(farmer=farmer)
            .values('order__customer')
            .distinct()
            .count()
        )
        # 7. Sales Over Time (last 30 days, daily)
        sales_over_time = []
        for i in range(29, -1, -1):
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            qty = OrderItem.objects.filter(
                farmer=farmer,
                status__in=['accepted', 'shipped', 'delivered'],
                created_at__range=(day_start, day_end)
            ).aggregate(total=Sum('quantity'))['total'] or 0
            sales_over_time.append({
                'date': day.strftime('%Y-%m-%d'),
                'quantity': qty
            })
        # 8. Best Selling Products (bar chart)
        best_selling_products = list(
            OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered'])
            .values('product__name')
            .annotate(qty=Sum('quantity'))
            .order_by('-qty')[:5]
        )
        # 9. Revenue by Category (pie chart)
        revenue_by_category = list(
            OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered'])
            .values('product__category')
            .annotate(revenue=Sum('total_price'))
            .order_by('-revenue')
        )
        # 10. Growth Metrics (compare last 30 days to previous 30 days)
        last_30 = now - timedelta(days=30)
        prev_30 = now - timedelta(days=60)
        sales_last_30 = OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered'], created_at__gte=last_30).aggregate(total=Sum('quantity'))['total'] or 0
        sales_prev_30 = OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered'], created_at__gte=prev_30, created_at__lt=last_30).aggregate(total=Sum('quantity'))['total'] or 0
        revenue_last_30 = OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered'], created_at__gte=last_30).aggregate(total=Sum('total_price'))['total'] or 0
        revenue_prev_30 = OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered'], created_at__gte=prev_30, created_at__lt=last_30).aggregate(total=Sum('total_price'))['total'] or 0
        sales_growth = ((sales_last_30 - sales_prev_30) / sales_prev_30 * 100) if sales_prev_30 else None
        revenue_growth = ((revenue_last_30 - revenue_prev_30) / revenue_prev_30 * 100) if revenue_prev_30 else None
        # 11. Pending Orders (order items with status 'pending')
        pending_orders = OrderItem.objects.filter(farmer=farmer, status='pending').count()
        # 12. Farmer average rating (mean of all ratings from reviews on this farmer's products)
        avg_rating = ProductReview.objects.filter(product__farmer=farmer).aggregate(avg=Avg('rating'))['avg'] or 0.0
        # 13. Recent orders (last 3 accepted/shipped/delivered OrderItems for this farmer)
        recent_orders_qs = OrderItem.objects.filter(farmer=farmer, status__in=['accepted', 'shipped', 'delivered']).order_by('-created_at')[:3]
        recent_orders = [
            {
                'id': oi.id,
                'product': oi.product.name,
                'qty': oi.quantity,
                'buyer': {
                    'username': oi.order.customer.user.username,
                    'first_name': oi.order.customer.user.first_name,
                    'last_name': oi.order.customer.user.last_name,
                },
                'status': oi.status.title(),
                'date': oi.created_at.strftime('%Y-%m-%d'),
                'amount': float(oi.total_price),
                'priority': 'high' if oi.status == 'pending' else 'medium',
            }
            for oi in recent_orders_qs
        ]
        return Response({
            'total_orders': total_orders,
            'total_sales_quantity': total_sales_quantity,
            'total_revenue': float(total_revenue),
            'best_seller': best_seller['product__name'] if best_seller else None,
            'active_listings': active_listings,
            'customer_count': customer_count,
            'sales_over_time': sales_over_time,
            'best_selling_products': best_selling_products,
            'revenue_by_category': revenue_by_category,
            'growth_metrics': {
                'sales_last_30': sales_last_30,
                'sales_prev_30': sales_prev_30,
                'sales_growth': sales_growth,
                'revenue_last_30': float(revenue_last_30),
                'revenue_prev_30': float(revenue_prev_30),
                'revenue_growth': revenue_growth,
            },
            'pending_orders': pending_orders,
            'avg_rating': round(avg_rating, 2),
            'recent_orders': recent_orders,
        })
