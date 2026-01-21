from django.shortcuts import render
from rest_framework import generics
from .models import InventoryProduct, InventoryReview, InventoryReviewLike
from .serializers import InventoryProductSerializer, InventoryReviewSerializer, InventoryReviewLikeSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from .filters import InventoryProductFilter
from rest_framework import status
from rest_framework.decorators import action

# Create your views here.

class InventoryProductListView(generics.ListAPIView):
    queryset = InventoryProduct.objects.all().order_by('-date_added')
    serializer_class = InventoryProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = InventoryProductFilter
    search_fields = ['name', 'description', 'category', 'subcategory', 'badge']
    ordering_fields = ['price', 'rating', 'date_added', 'date_updated', 'stock']
    ordering = ['-date_added']

class InventoryProductDetailView(generics.RetrieveAPIView):
    queryset = InventoryProduct.objects.all()
    serializer_class = InventoryProductSerializer

class InventorySubcategoryListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        category = request.GET.get('category')
        if not category:
            return Response([])
        subcategories = InventoryProduct.objects.filter(category=category).values_list('subcategory', flat=True).distinct()
        # Remove empty subcategories
        subcategories = [s for s in subcategories if s]
        return Response({'subcategories': subcategories})

class InventoryReviewListCreateView(generics.ListCreateAPIView):
    queryset = InventoryReview.objects.all().order_by('-date')
    serializer_class = InventoryReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'user', 'rating']
    search_fields = ['review']
    ordering_fields = ['date', 'rating']
    ordering = ['-date']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class InventoryReviewRatingDistributionView(APIView):
    def get(self, request):
        product_id = request.query_params.get('product')
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=400)
        reviews = InventoryReview.objects.filter(product_id=product_id)
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

class InventoryReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryReview.objects.all()
    serializer_class = InventoryReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class InventoryReviewLikeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk, action):
        try:
            review = InventoryReview.objects.get(pk=pk)
        except InventoryReview.DoesNotExist:
            return Response({'detail': 'Review not found.'}, status=status.HTTP_404_NOT_FOUND)
        user = request.user
        if action == 'like':
            obj, created = InventoryReviewLike.objects.get_or_create(review=review, user=user, defaults={'is_like': True})
            if not created and not obj.is_like:
                obj.is_like = True
                obj.save()
            review.likes = review.user_likes.filter(is_like=True).count()
            review.dislikes = review.user_likes.filter(is_like=False).count()
            review.save()
            return Response({'detail': 'Liked', 'likes': review.likes, 'dislikes': review.dislikes, 'user_liked': True, 'user_disliked': False})
        elif action == 'dislike':
            obj, created = InventoryReviewLike.objects.get_or_create(review=review, user=user, defaults={'is_like': False})
            if not created and obj.is_like:
                obj.is_like = False
                obj.save()
            review.likes = review.user_likes.filter(is_like=True).count()
            review.dislikes = review.user_likes.filter(is_like=False).count()
            review.save()
            return Response({'detail': 'Disliked', 'likes': review.likes, 'dislikes': review.dislikes, 'user_liked': False, 'user_disliked': True})
        elif action == 'unlike':
            InventoryReviewLike.objects.filter(review=review, user=user).delete()
            review.likes = review.user_likes.filter(is_like=True).count()
            review.dislikes = review.user_likes.filter(is_like=False).count()
            review.save()
            return Response({'detail': 'Unliked', 'likes': review.likes, 'dislikes': review.dislikes, 'user_liked': False, 'user_disliked': False})
        else:
            return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)
