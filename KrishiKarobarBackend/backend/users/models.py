from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone
from datetime import timedelta



PROVINCE_CHOICES = [
    ('Koshi', 'Koshi'),
    ('Madhesh', 'Madhesh'),
    ('Bagmati', 'Bagmati'),
    ('Gandaki', 'Gandaki'),
    ('Lumbini', 'Lumbini'),
    ('Karnali', 'Karnali'),
    ('Sudurpashchim', 'Sudurpashchim'),
]

class FarmerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmerprofile')
    phone = models.CharField(max_length=20)
    province = models.CharField(max_length=100, choices=PROVINCE_CHOICES, null=True, default='Bagmati')
    address = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    farm_name = models.CharField(max_length=255, blank=True)
    farm_size = models.CharField(max_length=50, blank=True)
    farming_experience = models.CharField(max_length=50, blank=True)
    crop_types = models.CharField(max_length=255, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/farmers/', blank=True, null=True)

    def __str__(self):
        return f'{self.user.username} – Farmer'

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customerprofile')
    phone = models.CharField(max_length=20)
    province = models.CharField(max_length=100, choices=PROVINCE_CHOICES, null=True, default='Bagmati')
    address = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    business_name = models.CharField(max_length=255, blank=True)
    business_type = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/customers/', blank=True, null=True)

    def __str__(self):
        return f'{self.user.username} – Customer'
