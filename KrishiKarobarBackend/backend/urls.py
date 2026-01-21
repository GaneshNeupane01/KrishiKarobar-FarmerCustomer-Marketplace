"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from backend.users import views as uviews
from backend.inventory import views as iviews
from django.contrib import admin
from django.urls import include,path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',uviews.RegisterView.as_view(),name='register'),
    path('api/register/',uviews.RegisterView.as_view(),name='api_register'),
    path('api/login/',uviews.LoginView.as_view(),name='api_login'),
    path('api/profile/', uviews.ProfileView.as_view(), name='api_profile'),
    
    
    # Users app URLs
    path('api/users/', include('backend.users.urls')),
    
    path('api/', include('backend.products.urls')),
    path('api/', include('backend.orders.urls')),
    path('api/', include('backend.connections.urls')),
    path('api/notifications/', include('backend.notifications.urls')),
    path('', include('backend.inventory.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)