from django.contrib import admin

# Register your models here.

from .models import FarmerProfile,CustomerProfile

admin.site.register(FarmerProfile)
admin.site.register(CustomerProfile)
