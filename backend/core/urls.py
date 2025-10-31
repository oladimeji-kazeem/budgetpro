from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # API URLs
    path("api/users/", include("users.urls")),
    
    # You can add other app URLs here, for example:
    # path("api/budget/", include("budget.urls")),
]