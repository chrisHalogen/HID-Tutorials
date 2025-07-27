# Build a Chat App using Python, Django and Socket.io

### Create a django project
All the necessary imports 
```
pip install django python-socketio uvicorn asgiref
```
Start a new project
```
django-admin startproject djchatsocket
```
Navigate into the project folder 
```
cd djchatsocket
```
Create the chat app
```
python manage.py startapp chat
```
## Serverside Setup
In `djchatsocket/settings.py`, set these variables:
```
ALLOWED_HOSTS = ["0.0.0.0", "127.0.0.1"]

INSTALLED_APPS = [
    ...
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'chat',
]
```

In `chat/models.py`:
```
from django.db import models
from django.utils import timezone

class Room(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    username = models.CharField(max_length=100)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.username} in {self.room.name}: {self.content[:20]}"
```

In `chat/views.py`:
```
from django.shortcuts import render, redirect

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        room_name = request.POST.get('room_name').lower()
        
        if username and room_name:
            request.session['username'] = username
            request.session['room_name'] = room_name
            
            # Create room if it doesn't exist (sync is fine here)
            Room.objects.get_or_create(name=room_name)
            
            return redirect('chat', room_name=room_name)
    
    return render(request, 'login.html')


def chat_view(request, room_name):
    username = request.session.get('username')
    if not username:
        return redirect('login')
    
    # Ensure room name is in lowercase
    room_name = room_name.lower()
    
    # Get room and last 50 messages
    try:
        room = Room.objects.get(name=room_name)
        messages = Message.objects.filter(room=room).order_by('-timestamp')[:50]
    except Room.DoesNotExist:
        messages = []
    
    # Format messages for template
    formatted_messages = []
    for message in messages:
        formatted_messages.append({
            'username': message.username,
            'content': message.content,
            'timestamp': message.timestamp,
            'is_system': message.username == 'System',
            'is_current_user': message.username == username,
        })
    
    context = {
        'room_name': room_name,
        'username': username,
        'messages': list(reversed(formatted_messages))  # Show oldest first
    }
    return render(request, 'chat.html', context)
```

In `djchatsocket/urls.py`:
```
from django.contrib import admin
from django.urls import path
from chat import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.login_view, name='login'),
    path('chat/<str:room_name>/', views.chat_view, name='chat'),
]
```

In `chat/socketio_events.py`:
```
import socketio
from datetime import datetime, timezone
from asgiref.sync import sync_to_async

from .models import Room, Message

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Store connected clients
connected_clients = {}

# Create async-compatible ORM operations
get_or_create_room = sync_to_async(Room.objects.get_or_create, thread_sensitive=True)
create_message = sync_to_async(Message.objects.create, thread_sensitive=True)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    if sid in connected_clients:
        room_name = connected_clients[sid]['room']
        username = connected_clients[sid]['username']
        
        # Create system message
        await save_and_broadcast_message(
            room_name=room_name,
            username='System',
            message=f'{username} has left the room'
        )
        
        del connected_clients[sid]

async def save_and_broadcast_message(room_name, username, message):
    """Save message to DB and broadcast to room"""
    # Get or create room
    room_obj, created = await get_or_create_room(name=room_name)
    
    # Save message (except for join/leave notifications)
    if username != 'System' or ('has joined' not in message and 'has left' not in message):
        msg = await create_message(
            room=room_obj,
            username=username,
            content=message
        )
        timestamp = msg.timestamp.isoformat()
    else:
        timestamp = datetime.now(timezone.utc).isoformat()
    
    # Broadcast message
    await sio.emit('message', {
        'username': username,
        'message': message,
        'timestamp': timestamp
    }, room=room_name)

@sio.event
async def join(sid, data):
    username = data.get('username')
    room_name = data.get('room').lower()
    
    if not username or not room_name:
        return False
    
    # Store user session
    connected_clients[sid] = {'username': username, 'room': room_name}
    
    # Join the room
    await sio.enter_room(sid, room_name)
    
    # Send welcome message
    await save_and_broadcast_message(
        room_name=room_name,
        username='System',
        message=f'{username} has joined the room'
    )

@sio.event
async def send_message(sid, data):
    if sid not in connected_clients:
        return False
    
    user = connected_clients[sid]
    message = data.get('message')
    
    if not message:
        return False
    
    # Save and broadcast message
    await save_and_broadcast_message(
        room_name=user['room'],
        username=user['username'],
        message=message
    )
```

In `djchatsocket/asgi.py`:
```
import os
from django.core.asgi import get_asgi_application
import socketio

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_project_2.settings')
django_app = get_asgi_application()

# Import socketio_events after Django is initialized
from chat.socketio_events import sio

# Create Socket.IO ASGI application
application = socketio.ASGIApp(sio, django_app)
```

## Clientside Setup
Check `chat/views.py`; you'll n0tice the need for us to create 2 html files namely `login.html` and `chat.html`. Let's move on to create those.

In `chat/templates/base.html`:
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Django - SocketIO Chat App</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4361ee;
            --secondary: #3f37c9;
            --success: #4cc9f0;
            --danger: #f72585;
            --light: #f8f9fa;
            --dark: #212529;
            --gray: #6c757d;
            --light-gray: #e9ecef;
            --border-radius: 8px;
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }
        
        body {
            background-color: #f5f7fb;
            color: var(--dark);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            width: 100%;
            max-width: 1200px;
        }
        
        .card {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            overflow: hidden;
        }
        
        .card-header {
            background-color: var(--primary);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .card-body {
            padding: 25px;
        }
        
        .btn {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: inline-block;
            text-align: center;
        }
        
        .btn:hover {
            background-color: var(--secondary);
            transform: translateY(-2px);
        }
        
        .btn-block {
            display: block;
            width: 100%;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--light-gray);
            border-radius: var(--border-radius);
            font-size: 16px;
            transition: border 0.3s ease;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
        }
        
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 80vh;
            max-height: 700px;
        }
        
        .chat-header {
            background-color: var(--primary);
            color: white;
            padding: 15px 20px;
            border-top-left-radius: var(--border-radius);
            border-top-right-radius: var(--border-radius);
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background-color: #f9f9ff;
            border-left: 1px solid var(--light-gray);
            border-right: 1px solid var(--light-gray);
        }
        
        .message {
            margin-bottom: 15px;
            max-width: 80%;
        }
        
        .message-self {
            margin-left: auto;
        }
        
        .message-content {
            padding: 12px 15px;
            border-radius: 18px;
            display: inline-block;
        }
        
        .message-other .message-content {
            background-color: white;
            border: 1px solid var(--light-gray);
            border-top-left-radius: 4px;
        }
        
        .message-self .message-content {
            background-color: var(--primary);
            color: white;
            border-top-right-radius: 4px;
        }
        
        .message-info {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            font-size: 12px;
            color: var(--gray);
        }
        
        .system-message {
            text-align: center;
            margin: 15px 0;
            color: var(--gray);
            font-size: 14px;
        }
        
        .chat-input {
            display: flex;
            padding: 15px;
            background-color: white;
            border: 1px solid var(--light-gray);
            border-bottom-left-radius: var(--border-radius);
            border-bottom-right-radius: var(--border-radius);
        }
        
        .chat-input input {
            flex: 1;
            margin-right: 10px;
        }
        
        .room-info {
            background-color: var(--secondary);
            color: white;
            padding: 10px 15px;
            border-radius: var(--border-radius);
            margin-bottom: 15px;
            text-align: center;
        }

        /* Add to existing base.css */
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background-color: #f9f9ff;
            border-left: 1px solid var(--light-gray);
            border-right: 1px solid var(--light-gray);
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .message {
            display: flex;
            flex-direction: column;
            max-width: 80%;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message-self {
            align-self: flex-end;
        }

        .message-other {
            align-self: flex-start;
        }

        .message-content {
            padding: 12px 15px;
            border-radius: 18px;
            display: inline-block;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            word-break: break-word;
        }

        .message-other .message-content {
            background-color: white;
            border: 1px solid #e6e6e6;
            border-top-left-radius: 4px;
        }

        .message-self .message-content {
            background-color: #4361ee;
            color: white;
            border-top-right-radius: 4px;
        }

        .message-info {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            font-size: 12px;
            color: var(--gray);
            padding: 0 5px;
            gap: 1rem;
        }

        .system-message {
            text-align: center;
            margin: 10px 0;
            color: var(--gray);
            font-size: 13px;
            font-style: italic;
        }

        .message-username {
            font-weight: 500;
            color: #6c757d;
        }

        /* Scrollbar styling */
        .chat-messages::-webkit-scrollbar {
            width: 8px;
        }

        .chat-messages::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
    </style>
</head>
<body>
    <div class="container">
        {% block content %}{% endblock %}
    </div>
    
    {% block extra_js %}{% endblock %}
</body>
</html>
```
In `chat/templates/login.html`;
```
{% extends "base.html" %}

{% block content %}
<div class="card" style="max-width: 500px; margin: 0 auto;">
    <div class="card-header">
        <h2>Join Chat Room</h2>
    </div>
    <div class="card-body">
        <form method="post">
            {% csrf_token %}
            <div class="form-group">
                <input type="text" name="username" class="form-control" placeholder="Enter your username" required>
            </div>
            <div class="form-group">
                <input type="text" name="room_name" class="form-control" placeholder="Enter room name" required>
            </div>
            <button type="submit" class="btn btn-block">Join Room</button>
        </form>
    </div>
</div>
{% endblock %}
```
In `chat/templates/chat.html`;
```
{% extends "base.html" %}

{% block content %}
<div class="chat-container">
    <div class="chat-header">
        <h2>{{ room_name }} Chat Room</h2>
    </div>
    
    <div class="room-info">
        You are chatting as <strong>{{ username }}</strong>
    </div>
    
    <div class="chat-messages" id="chat-messages">
        {% for message in messages %}
            <div class="message {% if message.is_current_user %}message-self{% else %}message-other{% endif %}">
                <div class="message-content">
                    {{ message.content }}
                </div>
                <div class="message-info">
                    <span class="message-username">
                        {% if not message.is_system and not message.is_current_user %}
                            {{ message.username }}
                        {% endif %}
                    </span>
                    <span class="message-time">
                        {{ message.timestamp|date:"H:i" }}
                    </span>
                </div>
            </div>
        {% endfor %}
    </div>
    
    <div class="chat-input">
        <input type="text" id="message-input" class="form-control" placeholder="Type your message..." autocomplete="off">
        <button class="btn" id="send-button">Send</button>
    </div>
</div>
{% endblock %}

{% block extra_js %}
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.4.1/socket.io.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const roomName = "{{ room_name|lower }}";
        const username = "{{ username }}";
        const socket = io();
        
        // Join the room
        socket.emit('join', {
            username: username,
            room: roomName
        });
        
        // Handle incoming messages
        socket.on('message', function(data) {
            appendMessage(data);
        });
        
        function appendMessage(data) {
            const messagesContainer = document.getElementById('chat-messages');
            const isSystem = data.username === 'System';
            const isCurrentUser = data.username === username;
            
            // Create message element
            const messageElement = document.createElement('div');
            
            if (isSystem) {
                // System message
                messageElement.className = 'system-message';
                messageElement.textContent = data.message;
            } else {
                // User message
                messageElement.className = isCurrentUser ? 
                    'message message-self' : 'message message-other';
                
                messageElement.innerHTML = `
                    <div class="message-content">${data.message}</div>
                    <div class="message-info">
                        <span class="message-username">
                            ${!isCurrentUser ? data.username : ''}
                        </span>
                        <span class="message-time">
                            ${new Date(data.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                `;
            }
            
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Send message
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        
        function sendMessage() {
            const message = messageInput.value.trim();
            if (message) {
                socket.emit('send_message', {
                    message: message
                });
                messageInput.value = '';
            }
        }
        
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Scroll to bottom initially
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
</script>
{% endblock %}
```

## Test Run the app
You can decide to run your server manually using the following commands:
- Register your migrations - `python manage.py migrate`
- Push the migrations to Django database - `python manage.py makemigrations`
- Now run the server with uvicorn - `uvicorn djchatsocket.asgi:application --host 0.0.0.0 --port 8000 --reload`
 
Alternatively, you can create a file to start the `uvicorn` server.
In `project_root/run.sh`, add the following:
```
#!/bin/bash

# Run database migrations
python manage.py migrate
python manage.py makemigrations

# Run the ASGI server with Uvicorn
uvicorn djchatsocket.asgi:application --host 0.0.0.0 --port 8000 --reload
```
Make `run.sh` executable - `chmod u+x run.sh`
Now execute the file: `run.sh`

Don't forget to support us by linking the video and subscribing to the channel.



