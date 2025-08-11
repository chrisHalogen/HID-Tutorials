from django.shortcuts import render, redirect
from .models import Room, Message

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