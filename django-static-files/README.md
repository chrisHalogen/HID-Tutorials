# Django Static Files Tutorial

This tutorial will show you how to set up static files in Django, both project-wide and for a specific app, and how to serve them for download.

## 1. Setting Up Static Files in Django

### Project Structure
```
myproject/
    manage.py
    myproject/
        settings.py
        urls.py
        ...
    myapp/
        static/
            myapp/
                example.txt
        ...
    static/
        project_wide.txt
```

### Step 1: Configure Settings

First, make sure your `settings.py` has these configurations:

```python
# settings.py

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),  # Project-wide static files
]

# For production, you'll also need:
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### Step 2: Create Static Files

1. **Project-wide static files** (accessible to all apps):
   - Create a `static/` directory in your project root (same level as `manage.py`)
   - Add any files here, like `project_wide.txt`

2. **App-specific static files**:
   - Create a `static/` directory inside your app directory
   - Inside that, create another directory with your app's name (to avoid namespace collisions)
   - Add your files here, like `myapp/static/myapp/example.txt`

### Step 3: Create a View to Serve Static Files

```python
# myapp/views.py
from django.conf import settings
from django.http import FileResponse, Http404
import os

def download_static_file(request, file_type):
    try:
        if file_type == 'project':
            file_path = os.path.join(settings.STATICFILES_DIRS[0], 'project_wide.txt')
        elif file_type == 'app':
            file_path = os.path.join(settings.BASE_DIR, 'myapp', 'static', 'myapp', 'example.txt')
        else:
            raise Http404("File not found")
        
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
        else:
            raise Http404("File not found")
    except Exception as e:
        raise Http404("File not found")
```

### Step 4: Create URL Patterns

```python
# myproject/urls.py
from django.urls import path
from myapp import views

urlpatterns = [
    path('download/<str:file_type>/', views.download_static_file, name='download_file'),
]
```

### Step 5: Test It Out

1. Run your development server:
   ```bash
   python manage.py runserver
   ```

2. Access the files:
   - Project-wide file: `http://localhost:8000/download/project/`
   - App-specific file: `http://localhost:8000/download/app/`

### Step 6: Accessing Files in Browser

1. **Project-wide static files**:
   ```
   http://localhost:8000/static/project_wide.txt
   ```

2. **App-specific static files**:
   ```
   http://localhost:8000/static/myapp/example.txt
   ```

   Notice the `myapp/` prefix which comes from the directory structure `myapp/static/myapp/`

### Step 8: Serving Static Files in Production

In production (`DEBUG=False`), you need to:

1. Set `STATIC_ROOT` in settings.py:
   ```python
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
   ```

2. Run collectstatic:
   ```bash
   python manage.py collectstatic
   ```

3. Configure your web server (Nginx example):
   ```nginx
   location /static/ {
       alias /path/to/your/project/staticfiles/;
   }
   ```


## Step 9: Accessing Static Files in Templates

If you want to reference static files in templates (for CSS, JS, etc.):

1. Add this at the top of your template:
   ```html
   {% load static %}
   ```

2. Reference files using the static tag:
   ```html
   <link rel="stylesheet" href="{% static 'myapp/example.txt' %}">
   ```

## Important Notes

1. In development (DEBUG=True), Django will serve static files automatically.
2. In production, you need to:
   - Run `collectstatic` (`python manage.py collectstatic`)
   - Configure your web server (Nginx, Apache) to serve static files
3. For user-uploaded files, use `MEDIA_URL` and `MEDIA_ROOT` instead of static files

This gives you a basic setup for handling static files in Django for both project-wide and app-specific cases, with the ability to serve them for download.
