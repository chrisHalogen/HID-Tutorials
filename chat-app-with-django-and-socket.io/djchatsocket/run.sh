#!/bin/bash

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Run the ASGI server with Uvicorn
uvicorn djchatsocket.asgi:application --host 0.0.0.0 --port 8000 --reload