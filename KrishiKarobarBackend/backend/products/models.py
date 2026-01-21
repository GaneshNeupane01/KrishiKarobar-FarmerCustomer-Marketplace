from django.db import models
from django.conf import settings
from backend.users.models import FarmerProfile

# Create your models here.

class Product(models.Model):
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    subcategory = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    min_order = models.PositiveIntegerField(blank=True, null=True)
    unit = models.CharField(max_length=50)
    province = models.CharField(max_length=100)
    product_address = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    stock = models.PositiveIntegerField()
    status = models.CharField(max_length=50, default='Active')
    date_added = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    rating = models.FloatField(default=0.0)
    review_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} by {self.farmer.user.username}"

class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    review = models.TextField(blank=True)
    image = models.ImageField(upload_to='reviews/', blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)
    dislikes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Review by {self.user.username} on {self.product.name}"

class ReviewLike(models.Model):
    review = models.ForeignKey(ProductReview, on_delete=models.CASCADE, related_name='user_likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_like = models.BooleanField()  # True for like, False for dislike
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['review', 'user']

    def __str__(self):
        action = "liked" if self.is_like else "disliked"
        return f"{self.user.username} {action} review by {self.review.user.username}"
