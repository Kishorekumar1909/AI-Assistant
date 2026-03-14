"""Chat views: session CRUD + LLM message sending."""

import logging
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatSession, Message
from .serializers import (
    ChatSessionSerializer,
    ChatSessionDetailSerializer,
    MessageSerializer,
    SendMessageSerializer,
)
from .groq_client import get_chat_completion

logger = logging.getLogger(__name__)


class ChatSessionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/chats/          — List all sessions for the authenticated user.
    POST /api/chats/          — Create a new chat session.
    """

    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by("-updated_at")

    def perform_create(self, serializer):
        title = self.request.data.get("title", "New Chat")
        serializer.save(user=self.request.user, title=title)


class ChatSessionDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/chats/<id>/   — Retrieve a single session with messages.
    DELETE /api/chats/<id>/   — Delete a chat session.
    """

    serializer_class = ChatSessionDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


class ChatSessionRenameView(APIView):
    """PATCH /api/chats/<id>/rename/ — Rename a chat session."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        session = get_object_or_404(ChatSession, pk=pk, user=request.user)
        title = request.data.get("title", "").strip()
        if not title:
            return Response({"detail": "Title cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        session.title = title
        session.save(update_fields=["title"])
        return Response({"id": str(session.id), "title": session.title})


class MessageListView(generics.ListAPIView):
    """
    GET /api/chats/<id>/messages/ — Paginated message list for a session.
    """

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        session_id = self.kwargs["pk"]
        # Ensure the session belongs to the requesting user
        get_object_or_404(ChatSession, pk=session_id, user=self.request.user)
        return Message.objects.filter(chat_session_id=session_id).order_by("created_at")


class SendMessageView(APIView):
    """
    POST /api/chats/<id>/send/
    Body: { "content": "user message" }
    1. Validates input
    2. Saves user message
    3. Loads full conversation history
    4. Calls Groq Llama3
    5. Saves assistant response
    6. Returns both messages
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        session = get_object_or_404(ChatSession, pk=pk, user=request.user)

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_content = serializer.validated_data["content"]

        # Save user message first
        user_msg = Message.objects.create(
            chat_session=session,
            role="user",
            content=user_content,
        )

        # Load history (excluding the just-saved message for clean ordering)
        history = list(
            Message.objects.filter(chat_session=session)
            .exclude(pk=user_msg.pk)
            .order_by("created_at")
            .values("role", "content")
        )

        # Call Groq API
        try:
            assistant_content = get_chat_completion(history, user_content)
        except Exception as exc:
            logger.exception("Groq API error for session %s: %s", pk, exc)
            user_msg.delete()  # Roll back user message on failure
            return Response(
                {"detail": "Failed to get a response from the AI. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Save assistant response
        assistant_msg = Message.objects.create(
            chat_session=session,
            role="assistant",
            content=assistant_content,
        )

        # Auto-title the session from the first user message
        if session.title == "New Chat" and Message.objects.filter(chat_session=session, role="user").count() == 1:
            session.title = user_content[:60]
            session.save(update_fields=["title", "updated_at"])
        else:
            session.save(update_fields=["updated_at"])

        return Response(
            {
                "user_message": MessageSerializer(user_msg).data,
                "assistant_message": MessageSerializer(assistant_msg).data,
                "session_title": session.title,
            },
            status=status.HTTP_200_OK,
        )
