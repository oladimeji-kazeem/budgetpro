from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import UserRegistrationSerializer, CustomTokenObtainPairSerializer
from .models import CustomUser

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login view that uses the custom serializer to include user role in the token.
    """
    serializer_class = CustomTokenObtainPairSerializer

class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for new user registration.
    Accessible by anyone (permission_classes = [AllowAny]).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "Registration successful. Please wait for admin approval."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )
