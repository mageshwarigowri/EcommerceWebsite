# Ecommerce Website

Django ecommerce prototype with an Admin-managed catalog.

## Features

- Django Admin for categories, products, uploaded product images, and orders
- SQLite development database
- Session-backed cart
- Anonymous checkout saved as orders
- Search and category filtering

## Local Setup

```powershell
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Admin URL:

```text
http://127.0.0.1:8000/admin/
```

Prototype admin credentials:

```text
username: admin
password: admin123
```

## Deployment Note

GitHub Pages only hosts static files. It cannot run Django, SQLite, file uploads, sessions, checkout persistence, or the Django Admin panel. Deploy this Django version to a Python-capable host such as Render, Railway, PythonAnywhere, Fly.io, or a VPS.

This repository includes a GitHub Pages workflow for the static Vite prototype. That workflow publishes the static frontend only; the Django Admin-backed app still needs a Python host.
