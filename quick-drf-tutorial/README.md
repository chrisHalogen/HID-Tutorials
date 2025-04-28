# Django REST Framework Quick Tutorial (Under 10 Minutes)

This tutorial will show you how to create a simple REST API using Django and Django REST Framework (DRF).

## Step 1: Setup

First, create a new Django project and app:

```bash
# Create and activate virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install Django and DRF
pip install django djangorestframework

# Create project and app
django-admin startproject backend
cd backend
python manage.py startapp api
```

## Step 2: Configure Settings

Add `rest_framework` and your app to `INSTALLED_APPS` in `myapi/settings.py`:

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'api',
]
```

## Step 3: Create a Model

In `api/models.py`, create a simple model:

```python
from django.db import models

class Task(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

## Step 4: Create Serializer

Create a new file `api/serializers.py`:

```python
from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'completed', 'created_at']
```

## Step 5: Create Views

In `api/views.py`:

```python
from rest_framework import generics
from .models import Task
from .serializers import TaskSerializer

class TaskListCreate(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TaskRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
```

## Step 6: Configure URLs

First, in `api/urls.py` (create this file):

```python
from django.urls import path
from .views import TaskListCreate, TaskRetrieveUpdateDestroy

urlpatterns = [
    path('tasks/', TaskListCreate.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskRetrieveUpdateDestroy.as_view(), name='task-retrieve-update-destroy'),
]
```

Then include these in `myapi/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

## Step 7: Migrate and Run

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

## Step 8: Test Your API

Your API is now available at:
- `http://localhost:8000/api/tasks/` (GET for list, POST to create)
- `http://localhost:8000/api/tasks/1/` (GET, PUT, PATCH, DELETE for specific task)

You can test it with curl or Postman:
```bash
# Create a task
curl -X POST -H "Content-Type: application/json" -d '{"title":"Learn DRF","completed":false}' http://localhost:8000/api/tasks/

# List all tasks
curl http://localhost:8000/api/tasks/
```

## Step 9: Go Indepth in Creating Rest API With Python Django

Learn Django Rest Framework indepth which features the following:
- File Organization
- Django Models
- Importing data from Django to Excel DB
- JSON; Javascript Object Notation
- Writing your first API View
- Function-Based Views and Class-Based Views
- Implementing a CRUD system using DRF
- Serializers
- Adding Fields to Serializers
- Filtering Queryset Data
- Pagination in DRF
- Generic API Views
- Mixins in DRF
- Viewsets and Routers
- Advanced Relationship Serializers
- How to Create New Users over API
- Authentication and Permissions/Authorization in DRF
- Basic Authentication
- Token Authentication
- How to Write Your Permission Class
- Session Authentication
- JWT Authentication
- API Documentation with Swagger

Link: [Click Here for the guide](https://www.youtube.com/watch?v=7IXFW9tjLvI)

## Summary

In under 10 minutes, you've:
1. Set up Django and DRF
2. Created a model
3. Made a serializer
4. Built views with generic API views
5. Configured URLs
6. Tested your REST API

This gives you full CRUD (Create, Read, Update, Delete) functionality for your Task model!
