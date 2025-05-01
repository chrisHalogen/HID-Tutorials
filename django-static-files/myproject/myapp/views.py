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