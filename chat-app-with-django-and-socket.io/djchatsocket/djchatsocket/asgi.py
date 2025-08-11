"""
ASGI config for djchatsocket project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djchatsocket.settings')

# application = get_asgi_application()

import os
from django.core.asgi import get_asgi_application
import socketio

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djchatsocket.settings')
django_app = get_asgi_application()

# Import socketio_events after Django is initialized
from chat.socketio_events import sio

# Create Socket.IO ASGI application
application = socketio.ASGIApp(sio, django_app)
