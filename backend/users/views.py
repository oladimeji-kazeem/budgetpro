from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer, 
    AccessRequestSerializer,
    AccessRequestActionSerializer
)
from .models import CustomUser, UserAccessRequest

# --- Custom Permissions ---
class IsAppAdminOrSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow App Admins or Super Admins to view/approve requests.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Check if the user's role is App Admin or Super Admin
        return request.user.role in ['AA', 'SA']

# --- JWT Views ---
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login view that uses the custom serializer to include user role in the token.
    """
    serializer_class = CustomTokenObtainPairSerializer

# --- User Registration View ---
class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for new user registration.
    Accessible by anyone (permission_classes = [AllowAny]).
    Handles creation of the CustomUser (inactive) and the UserAccessRequest (pending).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # The creation logic is mostly handled within the serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # NOTE: Email sending logic to Admins should be triggered here or in the serializer's create method.
        
        return Response(
            {"message": "Registration successful. An email has been sent to the access approvers."},
            status=status.HTTP_201_CREATED
        )

# --- Admin Access Request Management Views ---

class PendingAccessRequestListView(generics.ListAPIView):
    """
    API endpoint for App Admins/Super Admins to view all pending access requests.
    """
    # Only list requests that are pending
    queryset = UserAccessRequest.objects.filter(status='PENDING').select_related('user')
    serializer_class = AccessRequestSerializer
    permission_classes = [IsAppAdminOrSuperAdmin]

class AccessRequestActionView(generics.UpdateAPIView):
    """
    API endpoint for App Admins/Super Admins to approve or reject a specific access request.
    """
    queryset = UserAccessRequest.objects.filter(status='PENDING')
    serializer_class = AccessRequestActionSerializer
    permission_classes = [IsAppAdminOrSuperAdmin]
    lookup_field = 'pk' # The ID of the UserAccessRequest

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        rejection_reason = serializer.validated_data.get('rejection_reason', '')
        admin_user = request.user

        try:
            with transaction.atomic():
                if action == 'APPROVE':
                    # 1. Update the UserAccessRequest
                    instance.status = 'APPROVED'
                    instance.approved_by = admin_user
                    instance.approval_date = timezone.now()
                    instance.save()

                    # 2. Update the CustomUser profile
                    user_to_approve = instance.user
                    user_to_approve.is_approved = True
                    user_to_approve.is_active = True # Allow login
                    user_to_approve.save()
                    
                    # TODO: Send email notification to the requester (user_to_approve) with login link
                    
                    return Response({"message": f"User {user_to_approve.email} approved successfully."}, 
                                    status=status.HTTP_200_OK)

                elif action == 'REJECT':
                    if not rejection_reason:
                        return Response(
                            {"detail": "Rejection reason is required for REJECT action."},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    # 1. Update the UserAccessRequest
                    instance.status = 'REJECTED'
                    instance.rejection_reason = rejection_reason
                    instance.approved_by = admin_user
                    instance.approval_date = timezone.now()
                    instance.save()

                    # 2. Keep CustomUser inactive (is_active=False, is_approved=False)
                    
                    # TODO: Send email notification to the requester with the rejection reason
                    
                    return Response({"message": f"User {instance.user.email} rejected."}, 
                                    status=status.HTTP_200_OK)
                
                # Should not be reached
                return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Handle potential database errors
            return Response({"detail": f"An unexpected error occurred: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
