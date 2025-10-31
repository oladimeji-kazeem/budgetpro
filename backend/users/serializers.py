from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, UserAccessRequest

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes the JWT token payload to include user's role and other details.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        return token

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Creates a user with `is_active=False` and a corresponding `UserAccessRequest`.
    """
    # Ensure password is not readable
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    # Limit role choices for self-registration
    role = serializers.ChoiceField(choices=[('DO', 'Dept Officer'), ('HOD', 'Head of Department')])

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'first_name', 'last_name', 'department', 'role')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'department': {'required': True},
        }

    def create(self, validated_data):
        """
        Override the create method to handle user and access request creation atomically.
        """
        try:
            with transaction.atomic():
                # Create the user but mark as inactive until approved
                user = CustomUser.objects.create_user(
                    email=validated_data['email'],
                    password=validated_data['password'],
                    first_name=validated_data['first_name'],
                    last_name=validated_data['last_name'],
                    department=validated_data['department'],
                    role=validated_data['role'],
                    is_active=False,  # User cannot log in until approved
                    is_approved=False
                )
                # Create an access request for the admin to review
                UserAccessRequest.objects.create(user=user, requested_role=user.role)
                return user
        except Exception as e:
            # If anything fails, the transaction will be rolled back.
            raise serializers.ValidationError({"detail": f"An error occurred during registration: {e}"})