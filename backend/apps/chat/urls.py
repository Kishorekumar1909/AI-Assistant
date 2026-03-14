"""URL patterns for the chat app."""

from django.urls import path
from .views import (
    ChatSessionListCreateView,
    ChatSessionDetailView,
    ChatSessionRenameView,
    MessageListView,
    SendMessageView,
)

urlpatterns = [
    path("", ChatSessionListCreateView.as_view(), name="chat-list-create"),
    path("<uuid:pk>/", ChatSessionDetailView.as_view(), name="chat-detail"),
    path("<uuid:pk>/rename/", ChatSessionRenameView.as_view(), name="chat-rename"),
    path("<uuid:pk>/messages/", MessageListView.as_view(), name="chat-messages"),
    path("<uuid:pk>/send/", SendMessageView.as_view(), name="chat-send"),
]
