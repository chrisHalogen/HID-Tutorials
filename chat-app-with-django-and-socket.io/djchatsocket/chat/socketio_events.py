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