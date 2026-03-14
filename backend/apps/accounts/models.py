"""Custom User model extending AbstractUser."""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with email as a required unique field."""

    email = models.EmailField(unique=True)

    # Login is performed with email + password
    USERNAME_FIELD = "email"
    # username is collected at signup but is not the login field
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username
