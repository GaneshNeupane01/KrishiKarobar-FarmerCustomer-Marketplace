from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Message, Conversation
from .serializers import MessageSerializer, ConversationSerializer
from backend.users.models import FarmerProfile, CustomerProfile

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver', 'product')

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get all conversations for the current user"""
        user = request.user
        conversations = Conversation.objects.filter(
            participants=user
        ).prefetch_related('participants', 'last_message', 'product')
        
        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def conversation_messages(self, request):
        """Get messages for a specific conversation"""
        conversation_id = request.query_params.get('conversation_id')
        other_user_id = request.query_params.get('other_user_id')
        
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, participants=request.user)
                messages = Message.objects.filter(
                    Q(sender=request.user, receiver__in=conversation.participants.exclude(id=request.user.id)) |
                    Q(receiver=request.user, sender__in=conversation.participants.exclude(id=request.user.id))
                ).select_related('sender', 'receiver', 'product').order_by('created_at')
            except Conversation.DoesNotExist:
                return Response({'error': 'Conversation not found'}, status=404)
        elif other_user_id:
            messages = Message.objects.filter(
                Q(sender=request.user, receiver_id=other_user_id) |
                Q(receiver=request.user, sender_id=other_user_id)
            ).select_related('sender', 'receiver', 'product').order_by('created_at')
        else:
            return Response({'error': 'Either conversation_id or other_user_id is required'}, status=400)

        # Mark messages as read
        messages.filter(receiver=request.user, is_read=False).update(is_read=True)
        
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """Send a new message"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save()
            return Response(MessageSerializer(message, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        if message.receiver == request.user:
            message.is_read = True
            message.save()
            return Response({'status': 'Message marked as read'})
        return Response({'error': 'Unauthorized'}, status=403)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread messages"""
        count = Message.objects.filter(receiver=request.user, is_read=False).count()
        return Response({'unread_count': count})

class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(participants=user).prefetch_related(
            'participants', 'last_message', 'product'
        )

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark all messages in a conversation as read"""
        conversation = self.get_object()
        conversation.mark_as_read(request.user)
        return Response({'status': 'Conversation marked as read'})

    @action(detail=False, methods=['get'])
    def with_farmer(self, request):
        """Get conversations with farmers"""
        user = request.user
        if hasattr(user, 'customerprofile'):
            # Customer getting conversations with farmers
            conversations = Conversation.objects.filter(
                participants=user
            ).prefetch_related('participants', 'last_message', 'product')
            
            # Filter to only include conversations where the other participant is a farmer
            customer_conversations = []
            for conversation in conversations:
                other_participant = conversation.get_other_participant(user)
                if other_participant and hasattr(other_participant, 'farmerprofile'):
                    customer_conversations.append(conversation)
        else:
            return Response({'error': 'Only customers can view farmer conversations'}, status=403)
        
        serializer = self.get_serializer(customer_conversations, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def with_customer(self, request):
        """Get conversations with customers"""
        user = request.user
        if hasattr(user, 'farmerprofile'):
            # Farmer getting conversations with customers
            conversations = Conversation.objects.filter(
                participants=user
            ).prefetch_related('participants', 'last_message', 'product')
            
            # Filter to only include conversations where the other participant is a customer
            farmer_conversations = []
            for conversation in conversations:
                other_participant = conversation.get_other_participant(user)
                if other_participant and hasattr(other_participant, 'customerprofile'):
                    farmer_conversations.append(conversation)
        else:
            return Response({'error': 'Only farmers can view customer conversations'}, status=403)
        
        serializer = self.get_serializer(farmer_conversations, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all_conversations(self, request):
        """Get all conversations for the current user"""
        user = request.user
        conversations = Conversation.objects.filter(
            participants=user
        ).prefetch_related('participants', 'last_message', 'product')
        
        serializer = self.get_serializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)
