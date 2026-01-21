from django.urls import path
from .views import NotificationListView, MarkReadView, ClearNotificationView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('mark_read/', MarkReadView.as_view(), name='notification-mark-read'),
    path('clear/', ClearNotificationView.as_view(), name='notification-clear'),
] 