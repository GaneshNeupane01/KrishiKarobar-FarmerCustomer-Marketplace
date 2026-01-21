from django.db import models
from django.db.models import Avg, Count

# Create your models here.

class InventoryProduct(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, choices=[
        ('Machinery', 'Machinery'),
        ('Farming Tool', 'Farming Tool'),
        ('Vegetables', 'Vegetables'),
        ('Fruits', 'Fruits'),
        ('Seeds', 'Seeds'),
        ('Fertilizer', 'Fertilizer'),
        ('Pesticide', 'Pesticide'),
        ('Grains', 'Grains'),
        ('Herbs', 'Herbs'),
        ('Dairy', 'Dairy'),
        ('Other', 'Other'),
    ])
    subcategory = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='inventory/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    min_order = models.PositiveIntegerField(blank=True, null=True)
    unit = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    stock = models.PositiveIntegerField()
    status = models.CharField(max_length=50, default='Active')
    date_added = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    rating = models.FloatField(default=0.0)
    review_count = models.PositiveIntegerField(default=0)
    badge = models.CharField(max_length=50, blank=True, default='')
    featured = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
        if self.featured:
            self.badge = 'Featured'
        elif self.date_added and (now - self.date_added).days < 7:
            self.badge = 'Newly Added'
        else:
            self.badge = ''
        super().save(*args, **kwargs)

class InventoryReview(models.Model):
    product = models.ForeignKey(InventoryProduct, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    review = models.TextField(blank=True)
    image = models.ImageField(upload_to='inventory_reviews/', blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)
    dislikes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Review by {self.user.username} on {self.product.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.product.rating = self.product.reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0
        self.product.review_count = self.product.reviews.count()
        self.product.save(update_fields=['rating', 'review_count'])

    def delete(self, *args, **kwargs):
        product = self.product
        super().delete(*args, **kwargs)
        product.rating = product.reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0
        product.review_count = product.reviews.count()
        product.save(update_fields=['rating', 'review_count'])

class InventoryReviewLike(models.Model):
    review = models.ForeignKey(InventoryReview, on_delete=models.CASCADE, related_name='user_likes')
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    is_like = models.BooleanField()  # True for like, False for dislike
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['review', 'user']

    def __str__(self):
        action = "liked" if self.is_like else "disliked"
        return f"{self.user.username} {action} inventory review by {self.review.user.username}"
