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