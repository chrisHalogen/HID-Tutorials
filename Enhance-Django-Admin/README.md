
# 🎨 Enhance Django Admin with Jazzmin

## 📌 Introduction

[Jazzmin](https://github.com/farridav/django-jazzmin) is a modern, responsive, and customizable theme for Django's admin panel. It provides a sleek and professional UI with minimal setup.

----------

## 📺 Video Tutorial

🎥 Watch the step-by-step tutorial on YouTube: COMING SOON

----------

## 🚀 Installation

### 📌 Step 1: Install Jazzmin

Run the following command to install Jazzmin:

```bash
pip install django-jazzmin

```

----------

## 🔧 Configuration

### 📌 Step 2: Add Jazzmin to Installed Apps

Add `jazzmin` **at the top** of `INSTALLED_APPS` in your `settings.py` file:

```python
INSTALLED_APPS = [
    'jazzmin',  # Add this line
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Your apps
    'students_app',  # Replace with your actual app name
]

```

----------

### 📌 Step 3: Apply Migrations

Run the following command to apply migrations:

```bash
python manage.py migrate

```

----------

### 📌 Step 4: Restart the Django Server

Start or restart your Django development server:

```bash
python manage.py runserver

```

Visit **`http://127.0.0.1:8000/admin/`** to see the beautifully enhanced **Jazzmin** admin panel. 🚀

----------

## 🎨 Customization (Optional)

### 📌 Step 5: Customize Jazzmin Settings

To further customize Jazzmin, add the following `JAZZMIN_SETTINGS` dictionary in `settings.py`:

```python
JAZZMIN_SETTINGS = {
    "site_title": "My Project Admin",
    "site_header": "My Project",
    "welcome_sign": "Welcome to the admin panel",
    "site_brand": "My Brand",
    "copyright": "My Company",
    "search_model": "students_app.Students",  # Allows searching in Students model
    "show_ui_builder": True,  # Show UI builder for customizing appearance
}

```

----------

## 🔗 Project Guide

If you found this helpful, feel free to share this guide with your colleagues.

🔗 **Guide Link:** 

```bash
https://github.com/chrisHalogen/HID-Tutorials/tree/main/Enhance-Django-Admin

```

----------

## ❤️ Support the Channel

If you found this tutorial helpful, please support by:

👉 **Subscribing to the channel**  
👍 **Liking the video**  
📢 **Sharing it on your social media platforms**

📢 **Subscribe Here:** https://www.youtube.com/@halogenius-ideas  
📺 **Watch the Video Here:** COMING SOON

🚀 Thank you for your support! 🔥

