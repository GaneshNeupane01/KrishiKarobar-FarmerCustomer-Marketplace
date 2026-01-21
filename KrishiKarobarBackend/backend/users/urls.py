from django.urls import path
from .views import register, farmer_list, user_stats

urlpatterns = [
    path('register/', register, name='register'),
    path('farmers/', farmer_list, name='farmer-list'),
    path('stats/', user_stats, name='user-stats'),
] 