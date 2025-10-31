from django.urls import path
from .views import (
    UserRegistrationView, 
    CustomTokenObtainPairView, 
    PendingAccessRequestListView,
    AccessRequestActionView
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    # Auth and Token Management
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Admin/Approval Workflow Management
    # GET: List all pending requests
    path('access-requests/', PendingAccessRequestListView.as_view(), name='access-requests-list'),
    # PATCH/PUT: Approve or Reject a specific request (using the request's UUID primary key)
    path('access-requests/<uuid:pk>/action/', AccessRequestActionView.as_view(), name='access-requests-action'),
]
