"""Groq API client for Llama 3 chat completions."""

import logging
import httpx
from django.conf import settings

logger = logging.getLogger(__name__)

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = (
    "You are a helpful, concise, and friendly AI assistant. "
    "Respond clearly and accurately. If you don't know something, say so honestly."
)


def build_messages(history: list[dict], new_user_message: str) -> list[dict]:
    """
    Construct the messages array for the Groq API.

    Args:
        history: List of dicts with 'role' and 'content' from the DB.
        new_user_message: The latest user input.

    Returns:
        A list of message dicts ready for the Groq API.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": new_user_message})
    return messages


def get_chat_completion(history: list[dict], new_user_message: str) -> str:
    """
    Call the Groq API with message history and return the assistant's reply.

    Args:
        history: Previous messages in the session.
        new_user_message: The new prompt from the user.

    Returns:
        The assistant's response string.

    Raises:
        httpx.HTTPStatusError: On non-2xx responses.
        Exception: On other errors.
    """
    messages = build_messages(history, new_user_message)

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "max_tokens": settings.GROQ_MAX_TOKENS,
        "temperature": 0.7,
        "stream": False,
    }

    logger.debug("Calling Groq API | model=%s | messages=%d", settings.GROQ_MODEL, len(messages))

    with httpx.Client(timeout=60.0) as client:
        response = client.post(GROQ_CHAT_URL, headers=headers, json=payload)
        response.raise_for_status()

    data = response.json()
    content = data["choices"][0]["message"]["content"]
    logger.debug("Groq response received | tokens=%s", data.get("usage", {}).get("total_tokens"))
    return content
