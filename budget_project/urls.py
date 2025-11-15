from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django Admin Site
    path('admin/', admin.site.urls),
    
    # -----------------------------------------------------
    # CRITICAL FIX: Include the budgeting app's URLs
    # This ensures paths like /register/, /dashboard/, etc., are found.
    # We use '' to set the budgeting app as the root for user-facing pages.
    # -----------------------------------------------------
    path('', include('budgeting.urls')),
    
    # Optional: Django's built-in auth URLs (used for /login/ and /logout/)
    path('', include('django.contrib.auth.urls')),
]