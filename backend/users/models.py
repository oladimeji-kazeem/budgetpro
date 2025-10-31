from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid

# --- 1. Custom Manager (Required for AbstractBaseUser) ---
class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_approved', True)
        extra_fields.setdefault('role', 'SA') # Assign Super Admin role

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)

# --- 2. Custom User Model (AbstractBaseUser) ---
class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Core User Model defining the structure and roles for BudgetPro.
    It uses email as the unique identifier and includes the approval status.
    """
    # Define Roles
    ROLE_CHOICES = (
        ('DO', 'Dept Officer'),
        ('HOD', 'Head of Department'),
        ('AA', 'App Admin'),
        ('SA', 'Super Admin'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=False)
    
    # Custom Role and Access Fields
    role = models.CharField(max_length=3, choices=ROLE_CHOICES, default='DO')
    department = models.CharField(max_length=100, blank=True, null=True, help_text="User's assigned department for budgeting.")

    # Status Flags for Authentication and Access Workflow
    is_active = models.BooleanField(default=False, help_text="Set to True by Admin upon final approval.")
    is_approved = models.BooleanField(default=False, help_text="Indicates if the user has been approved by the App Admin.")
    is_staff = models.BooleanField(default=False)
    
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role', 'department']

    objects = CustomUserManager()

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        # Custom permission for privileged GL upload access, crucial for PFA compliance
        permissions = [
            ("can_upload_gl", "Can upload and map GL data"),
            ("can_approve_access", "Can approve or reject user access requests"),
        ]

    def __str__(self):
        return self.email

# --- 3. Access Request Model (For Audit and Approval Workflow) ---
class UserAccessRequest(models.Model):
    """
    Tracks new user registrations requiring approval from an App Admin.
    """
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Access Granted'),
        ('REJECTED', 'Access Denied'),
    )

    # Link the request to the CustomUser (OneToOne to enforce one pending request per user)
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='access_request',
        help_text="The user account requesting access."
    )
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    requested_role = models.CharField(max_length=3, choices=CustomUser.ROLE_CHOICES, default='DO')
    
    requested_at = models.DateTimeField(auto_now_add=True)
    
    # Audit trail fields
    approved_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_requests',
        limit_choices_to={'role__in': ['AA', 'SA']},
        help_text="The App Admin or Super Admin who took action."
    )
    approval_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, help_text="Reason for rejection, sent to the user.")

    def __str__(self):
        return f"Request for {self.user.email} - Status: {self.status}"

    class Meta:
        ordering = ['requested_at']
        verbose_name = 'User Access Request'
        verbose_name_plural = 'User Access Requests'
