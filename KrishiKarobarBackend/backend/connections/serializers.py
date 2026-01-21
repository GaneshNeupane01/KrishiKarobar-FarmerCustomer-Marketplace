from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Message, Conversation
from backend.users.models import CustomerProfile, FarmerProfile
from backend.products.models import Product

class UserProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    profile_picture = serializers.SerializerMethodField()
    user_type = serializers.SerializerMethodField()

    def get_profile_picture(self, obj):
        try:
            if hasattr(obj, 'customerprofile') and obj.customerprofile.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.customerprofile.profile_picture.url)
                return obj.customerprofile.profile_picture.url
            elif hasattr(obj, 'farmerprofile') and obj.farmerprofile.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.farmerprofile.profile_picture.url)
                return obj.farmerprofile.profile_picture.url
        except Exception:
            pass
        return None

    def get_user_type(self, obj):
        if hasattr(obj, 'farmerprofile'):
            return 'farmer'
        elif hasattr(obj, 'customerprofile'):
            return 'customer'
        return 'unknown'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'image', 'price', 'farmer']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    receiver = UserProfileSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    receiver_id = serializers.IntegerField(write_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'receiver', 'product', 'subject', 'content', 
            'is_read', 'created_at', 'updated_at', 'receiver_id', 'product_id'
        ]
        read_only_fields = ['id', 'sender', 'receiver', 'product', 'is_read', 'created_at', 'updated_at']

    def create(self, validated_data):
        receiver_id = validated_data.pop('receiver_id')
        product_id = validated_data.pop('product_id', None)
        
        sender = self.context['request'].user
        receiver = User.objects.get(id=receiver_id)
        product = Product.objects.get(id=product_id) if product_id else None
        
        message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            product=product,
            **validated_data
        )
        
        # Find or create conversation between these two users
        # First, try to find an existing conversation
        existing_conversation = None
        for conv in Conversation.objects.filter(participants=sender):
            if receiver in conv.participants.all():
                existing_conversation = conv
                break
        
        if existing_conversation:
            conversation = existing_conversation
            # Update product if provided
            if product:
                conversation.product = product
                conversation.save()
        else:
            # Create new conversation
            conversation = Conversation.objects.create(product=product)
            conversation.participants.add(sender, receiver)
        
        # Update last message
        conversation.last_message = message
        conversation.save()
        
        # Notification for new message
        from backend.notifications.models import Notification
        Notification.objects.create(
            recipient=receiver,
            type='message',
            text=f'New message from {sender.username}',
            link=None
        )
        
        return message

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserProfileSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    other_participant = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'last_message', 'other_participant', 
            'unread_count', 'product', 'created_at', 'updated_at'
        ]

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.get_other_participant(request.user)
            if other_user:
                return UserProfileSerializer(other_user, context=self.context).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_unread_count(request.user)
        return 0 