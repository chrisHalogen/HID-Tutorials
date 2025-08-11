from django.contrib import admin
from django.urls import path
from chat import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.login_view, name='login'),
    path('chat/<str:room_name>/', views.chat_view, name='chat'),
]