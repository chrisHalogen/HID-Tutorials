
# 🎓 Django + React Chat App Tutorial for Beginners

Build a **real-time chat application** using **Django** (with Django REST Framework and WebSockets) and **React**. Messages from the current user will appear on the left, and messages from other users will appear on the right — with a clean, modern UI.

---

## ✅ Prerequisites

Make sure you have the following installed:

- Python & Django
- Node.js & npm
- Redis
- `virtualenv` (recommended for Python environments)

---

## 📺 YouTube Tutorial

Watch the full video walkthrough on YouTube:  
🎥 [COMING SOON](https://youtu.be/LKxL-wlwTOw)

---

## ⚙️ Setting Up the Development Environment

1. **Create project directory**:
   ```bash
   mkdir django-react-chat
   cd django-react-chat
   ```

2. **Set up the backend**:

   ```bash
   virtualenv dj_chat
   cd dj_chat
   . bin/activate

   pip install django djangorestframework django-cors-headers channels channels-redis daphne

   django-admin startproject chatbackend
   cd chatbackend
   python manage.py startapp chat
   ```

3. **Set up the frontend with Vite**:

   ```bash
   cd ../../
   npm create vite@latest chatfrontend --template react
   cd chatfrontend
   npm install axios react-router-dom sass react-use-websocket
   ```

4. **Frontend folder structure** (`src/`):

   ```
   src/
   ├── components/
   │   ├── ChatRoom/
   │   │   ├── ChatRoom.jsx
   │   │   ├── ChatRoom.scss
   │   ├── JoinRoom/
   │   │   ├── JoinRoom.jsx
   │   │   ├── JoinRoom.scss
   ├── hooks/
   │   ├── useChat.js
   ├── App.jsx
   ├── App.scss
   ├── main.jsx
   ```

---

## 🛠️ Backend Configuration

### `chatbackend/settings.py` (key sections)

```python
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    ...
    'rest_framework',
    'corsheaders',
    'channels',
    'chat',
    'users',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOW_ALL_ORIGINS = True

ASGI_APPLICATION = 'chatbackend.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

STATIC_URL = '/static/'
```

---

## 🧱 Models

### `chat/models.py`

```python
from django.db import models

class Room(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    username = models.CharField(max_length=255)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('timestamp',)
```

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 📦 Serializers

### `chat/serializers.py`

```python
from rest_framework import serializers
from .models import Room, Message

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name']

class MessageSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.name', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'username', 'content', 'timestamp', 'room_name']
```

---

## 🌐 Views

### `chat/views.py`

```python
from rest_framework import generics
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer

class RoomList(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        room_name = self.kwargs['room_name'].lower()
        room, _ = Room.objects.get_or_create(name=room_name)
        return Message.objects.filter(room=room)
```

---

## 🌍 URLs

### `chat/urls.py`

```python
from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.RoomList.as_view()),
    path('rooms/<slug:room_name>/messages/', views.MessageList.as_view()),
]
```

> ✅ Using `slug` ensures the room name is URL-safe and lowercase.

### `chatbackend/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('chat.urls')),
]
```

---

## 🔌 WebSocket Consumers

### `chat/consumers.py`

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.get_or_create_room()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        username = data['username']
        message = data['message']
        room_name = data['room_name']

        room = await self.get_room(room_name)
        created_message = await self.create_message(room, username, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'username': username,
                'message': message,
                'timestamp': created_message.timestamp.isoformat()
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'username': event['username'],
            'content': event['message'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def get_or_create_room(self):
        return Room.objects.get_or_create(name=self.room_name)

    @database_sync_to_async
    def get_room(self, room_name):
        return Room.objects.get_or_create(name=room_name)[0]

    @database_sync_to_async
    def create_message(self, room, username, content):
        return Message.objects.create(room=room, username=username, content=content)
```

---

## 🔁 WebSocket Routing

### `chat/routing.py`

```python
from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),
]
```

---

## ⚡ ASGI Configuration

### `chatbackend/asgi.py`

```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatbackend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(chat.routing.websocket_urlpatterns)
    ),
})
```

---

## 🚀 Run the Development Server

```bash
python manage.py runserver
```

Your **Django + React Chat App backend** is now ready to go!

---

## 🧑‍💻 Frontend Setup with Vite & React

Set up the frontend using **Vite** with **React**, and build a simple chat interface that connects to the Django WebSocket backend.

### 1. Create Custom Hook: `useChat.js`

📄 Path: `src/hooks/useChat.js`

```js
import { useState, useCallback, useRef, useEffect } from "react";
import useWebSocket from "react-use-websocket";

export const useChat = (roomName, username) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const { sendMessage, lastMessage } = useWebSocket(
    `ws://localhost:8000/ws/chat/${roomName}/`,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/rooms/${roomName}/messages/`
        );
        const data = await response.json();
        setMessages(data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load messages");
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [roomName]);

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      setMessages((prev) => [...prev, data]);
    }
  }, [lastMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendChatMessage = useCallback(() => {
    if (message.trim()) {
      sendMessage(
        JSON.stringify({
          message,
          username,
          room_name: roomName,
        })
      );
      setMessage("");
    }
  }, [message, username, roomName, sendMessage]);

  return {
    messages,
    message,
    setMessage,
    isLoading,
    error,
    sendChatMessage,
    messagesEndRef,
  };
};
```

---

### 2. Create JoinRoom Component

📄 Path: `src/components/JoinRoom/JoinRoom.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinRoom.scss';

const JoinRoom = () => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && room) {
      navigate(`/chat/${room.toLowerCase()}`, { state: { username } });
    }
  };

  return (
    <div className="join-room-container">
      <div className="join-room-card">
        <h1>Join Chat Room</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="room">Room Name</label>
            <input
              type="text"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
              required
            />
          </div>
          <button type="submit" className="join-button">Join Room</button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom;
```

💅 Style: `src/components/JoinRoom/JoinRoom.scss`

```scss
.join-room-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;

  .join-room-card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;

    h1 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #555;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        transition: border-color 0.3s;

        &:focus {
          outline: none;
          border-color: #667eea;
        }
      }
    }

    .join-button {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(102, 126, 234, 0.5);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
```

---

### 3. Create ChatRoom Component

📄 Path: `src/components/ChatRoom/ChatRoom.jsx`

```jsx
import { useParams, useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import './ChatRoom.scss';

const ChatRoom = () => {
  const { roomName } = useParams();
  const { state } = useLocation();
  const username = state?.username || 'Anonymous';

  const {
    messages,
    message,
    setMessage,
    isLoading,
    error,
    sendChatMessage,
    messagesEndRef,
  } = useChat(roomName, username);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendChatMessage();
  };

  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <h2>Room: {roomName}</h2>
        <p>Welcome, {username}!</p>
      </div>

      <div className="messages-container">
        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.username === username ? 'sent' : 'received'
              }`}
            >
              <div className="message-content">
                {msg.username !== username && (
                  <span className="message-sender">{msg.username.toUpperCase()}</span>
                )}
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;
```

💅 Style: `src/components/ChatRoom/ChatRoom.scss`

```scss
.chat-room-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f5f7fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
      h2 {
        margin: 0;
        font-size: 1.5rem;
      }
  
      p {
        margin: 0.5rem 0 0;
        font-size: 1rem;
        opacity: 0.9;
      }
    }
  
    .messages-container {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      background-color: #e5e7eb;
  
      .message {
        display: flex;
        margin-bottom: 1rem;
  
        &.sent {
          justify-content: flex-end;
  
          .message-content {
            background-color: #667eea;
            color: white;
            border-radius: 18px 18px 0 18px;
          }
        }
  
        &.received {
          justify-content: flex-start;
  
          .message-content {
            background-color: white;
            color: #333;
            border-radius: 18px 18px 18px 0;
          }
        }
  
        .message-content {
          max-width: 70%;
          padding: 0.75rem 1rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
          .message-sender {
            display: block;
            font-weight: bold;
            font-size: 0.8rem;
            margin-bottom: 0.25rem;
            color: #555;
          }
  
          p {
            margin: 0;
            word-wrap: break-word;
          }
  
          .message-time {
            display: block;
            font-size: 0.7rem;
            margin-top: 0.25rem;
            opacity: 0.7;
            text-align: right;
          }
        }
      }
    }
  
    .message-form {
      display: flex;
      padding: 1rem;
      background-color: white;
      border-top: 1px solid #ddd;
  
      input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 25px;
        font-size: 1rem;
        margin-right: 0.5rem;
        outline: none;
        transition: border-color 0.3s;
  
        &:focus {
          border-color: #667eea;
        }
      }
  
      button {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
  
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 5px rgba(102, 126, 234, 0.5);
        }
  
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
```

---

## Set up Routing

In `src/App.jsx`:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinRoom from './components/JoinRoom/JoinRoom';
import ChatRoom from './components/ChatRoom/ChatRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/chat/:roomName" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## Set Up Entry Point

In `src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Global Styling (Optional)

Create a global styles file in `src/index.scss`:

```scss
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  color: #333;
}
```

---

## Run the Frontend

Make sure you have Vite installed and your dependencies set up.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Vite dev server:

   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:5173` in your browser.


---

## 🧪 Testing the Application

To test the chat app, follow these steps:

1. Open **two different browsers** or use **incognito mode** for the second window.
2. Navigate to: [http://localhost:3000/](http://localhost:3000/)
3. In both windows, enter a **username** and the **same room name**.
4. Start sending messages!
   - Your messages will appear **on the right** (as sent).
   - Messages from others will appear **on the left** (as received).
5. Messages should sync and display **in real-time** between both windows.

---

## ✅ Conclusion

You've successfully built a **real-time chat application** using **Django** and **React**! Here's what we covered:

- 🚀 Setting up Django with Django REST Framework and Channels  
- 🧠 Creating WebSocket consumers for real-time communication  
- ⚛️ Building a React frontend with a modern design  
- 🎨 Styling with SCSS for a polished look  
- 🔄 Implementing two-way real-time messaging via WebSockets  

You now have the foundation for a more advanced chat app. Well done! 👏

---

## 🔗 Share This Guide

📢 **Share this project with friends or dev colleagues:**

```
https://github.com/chrisHalogen/HID-Tutorials/tree/main/Host-React-On-Github
```

Feel free to fork or star the repository!

---

## 🎉 Support Us!

If this tutorial helped you, consider showing your support:

- 👍 Like the video → [Watch on YouTube](https://youtu.be/LKxL-wlwTOw)  
- 🔔 Subscribe to the channel → [Halogenius Ideas](https://www.youtube.com/@halogenius-ideas)  
- 📢 Share this project on your socials

Thank you for learning with us! 🙌💙


