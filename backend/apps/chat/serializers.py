"""Serializers for chat sessions and messages."""

from rest_framework import serializers
from .models import ChatSession, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("id", "role", "content", "created_at")
        read_only_fields = ("id", "role", "created_at")


class ChatSessionSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chat sessions."""

    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ("id", "title", "created_at", "updated_at", "last_message")
        read_only_fields = ("id", "created_at", "updated_at")

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if msg:
            return {"role": msg.role, "content": msg.content[:100]}
        return None


class ChatSessionDetailSerializer(serializers.ModelSerializer):
    """Full serializer including messages (used when fetching a single session)."""

    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ("id", "title", "created_at", "updated_at", "messages")
        read_only_fields = ("id", "created_at", "updated_at")


class SendMessageSerializer(serializers.Serializer):
    """Validate a new incoming user message."""

    content = serializers.CharField(min_length=1, max_length=8000)
