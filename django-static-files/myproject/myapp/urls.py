# myproject/urls.py
from django.urls import path
from myapp import views

urlpatterns = [
    path('download/<str:file_type>/', views.download_static_file, name='download_file'),
]