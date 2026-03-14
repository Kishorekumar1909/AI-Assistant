"""Django admin registration for chat models."""

from django.contrib import admin
from .models import ChatSession, Message


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "created_at", "updated_at")
    list_filter = ("user",)
    search_fields = ("title", "user__username")
    ordering = ("-updated_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "chat_session", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("content",)
    ordering = ("created_at",)
