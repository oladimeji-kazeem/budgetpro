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
        # Add is_approved and is_active to enforce access checks on the client
        token['is_approved'] = user.is_approved
        token['is_active'] = user.is_active 
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
                # Create the user but mark as inactive and unapproved
                user = CustomUser.objects.create_user(
                    email=validated_data['email'],
                    password=validated_data['password'],
                    first_name=validated_data['first_name'],
                    last_name=validated_data['last_name'],
                    department=validated_data['department'],
                    role=validated_data['role'],
                    is_active=False,
                    is_approved=False
                )
                # Create an access request for the admin to review
                UserAccessRequest.objects.create(
                    user=user, 
                    requested_role=user.role, 
                    status=UserAccessRequest.STATUS_CHOICES[0][0] # 'PENDING'
                )
                
                # TODO: Send email notification to App Admins (AA)
                
                return user
        except Exception as e:
            # If anything fails, the transaction will be rolled back.
            raise serializers.ValidationError({"detail": f"An error occurred during registration: {e}"})

class AccessRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for listing pending access requests.
    Includes read-only fields from the linked CustomUser.
    """
    user_email = serializers.ReadOnlyField(source='user.email')
    user_fullname = serializers.SerializerMethodField()

    class Meta:
        model = UserAccessRequest
        fields = (
            'id', 'user_email', 'user_fullname', 'requested_role', 
            'requested_at', 'status', 'rejection_reason'
        )
        read_only_fields = fields

    def get_user_fullname(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

class AccessRequestActionSerializer(serializers.Serializer):
    """
    Serializer to validate the data sent by the Admin for approving/rejecting a request.
    """
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT'], required=True)
    rejection_reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
