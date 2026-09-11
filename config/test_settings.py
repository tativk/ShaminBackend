"""Isolated test database; never reads or modifies the development database."""
from .settings import *  # noqa: F403

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
SMS_PROVIDER = 'console'
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
