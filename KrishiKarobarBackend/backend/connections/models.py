from django.db import models
from django.contrib.auth.models import User
from backend.users.models import CustomerProfile, FarmerProfile
from backend.products.models import Product

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    subject = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='conversations', null=True, blank=True)
    last_message = models.ForeignKey(Message, on_delete=models.SET_NULL, null=True, blank=True, related_name='last_message_conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        participant_names = [p.username for p in self.participants.all()]
        return f"Conversation between {', '.join(participant_names)}"

    def get_other_participant(self, user):
        """Get the other participant in the conversation"""
        return self.participants.exclude(id=user.id).first()

    def mark_as_read(self, user):
        """Mark all messages in this conversation as read for the given user"""
        # Get all messages where this user is the receiver and the other participant is in this conversation
        other_participants = self.participants.exclude(id=user.id)
        Message.objects.filter(
            receiver=user,
            sender__in=other_participants,
            is_read=False
        ).update(is_read=True)

    def get_unread_count(self, user):
        """Get count of unread messages for a user in this conversation"""
        other_participants = self.participants.exclude(id=user.id)
        return Message.objects.filter(
            receiver=user,
            sender__in=other_participants,
            is_read=False
        ).count()
