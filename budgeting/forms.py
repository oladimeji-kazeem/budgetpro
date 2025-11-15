from django import forms
from .models import CustomUser, Fund, Sector, Grade, Scenario, FundCategory, Region, State, Location, Account, DateDimension
from django.contrib.auth.forms import UserCreationForm

class GLUploadForm(forms.Form):
# ... (GLUploadForm implementation omitted for brevity) ...
    """
    A simple form to handle the CSV file upload for GL transactions.
    """
    csv_file = forms.FileField(
        label='Select GL/Ledger CSV File',
        help_text='Required columns: Date, Account Code, Fund Name, Department, State, Sector, Amount, Description, Scenario Name.'
    )

class ProfileUpdateForm(forms.ModelForm):
# ... (ProfileUpdateForm implementation omitted for brevity) ...
    """
    Form for users to update their own profile information.
    """
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'phone_no')
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'input-field'}),
            'last_name': forms.TextInput(attrs={'class': 'input-field'}),
            'email': forms.EmailInput(attrs={'class': 'input-field'}),
            'phone_no': forms.TextInput(attrs={'class': 'input-field', 'placeholder': 'e.g., +2348012345678'}),
        }

class FundForm(forms.ModelForm):
    """Form for creating and updating Fund records."""
    class Meta:
        model = Fund
        fields = ['fund_name', 'fund_type', 'fund_category']
        widgets = {
            'fund_name': forms.TextInput(attrs={'class': 'form-control'}),
            'fund_type': forms.Select(attrs={'class': 'form-control'}),
            'fund_category': forms.Select(attrs={'class': 'form-control'}),
        }

class FundCategoryForm(forms.ModelForm):
    """Form for creating and updating FundCategory records."""
    class Meta:
        model = FundCategory
        fields = ['category_name']
        widgets = {
            'category_name': forms.TextInput(attrs={'class': 'form-control'}),
        }

class SectorForm(forms.ModelForm):
    """Form for creating and updating Sector records."""
    class Meta:
        model = Sector
        fields = ['sector_name']
        widgets = {
            'sector_name': forms.TextInput(attrs={'class': 'form-control'}),
        }

class GradeForm(forms.ModelForm):
    """Form for creating and updating Grade records."""
    class Meta:
        model = Grade
        fields = ['grade_name', 'display_order']
        widgets = {
            'grade_name': forms.TextInput(attrs={'class': 'form-control'}),
            'display_order': forms.NumberInput(attrs={'class': 'form-control'}),
        }

class ScenarioForm(forms.ModelForm):
    """Form for creating and updating Scenario records."""
    class Meta:
        model = Scenario
        fields = ['scenario_name']
        widgets = {
            'scenario_name': forms.TextInput(attrs={'class': 'form-control'}),
        }

class RegionForm(forms.ModelForm):
    """Form for creating and updating Region records."""
    class Meta:
        model = Region
        fields = ['region_name']
        widgets = {
            'region_name': forms.TextInput(attrs={'class': 'form-control'}),
        }

class StateForm(forms.ModelForm):
    """Form for creating and updating State records."""
    class Meta:
        model = State
        fields = ['state_name', 'region']
        widgets = {
            'state_name': forms.TextInput(attrs={'class': 'form-control'}),
            'region': forms.Select(attrs={'class': 'form-control'}),
        }

class LocationForm(forms.ModelForm):
    """Form for creating and updating Location records."""
    class Meta:
        model = Location
        fields = ['location_name', 'state']
        widgets = {
            'location_name': forms.TextInput(attrs={'class': 'form-control'}),
            'state': forms.Select(attrs={'class': 'form-control'}),
        }

class AccountForm(forms.ModelForm):
    """Form for creating and updating Chart of Accounts records."""
    class Meta:
        model = Account
        fields = [
            'account_code', 'account_name', 'account_type', 'statement_category', 
            'hierarchy_level_1', 'hierarchy_level_2', 'hierarchy_level_3', 'hierarchy_level_4',
            'parent_account', 'is_leaf', 'active_flag', 'display_order',
        ]
        widgets = {
            'account_code': forms.TextInput(attrs={'class': 'form-control'}),
            'account_name': forms.TextInput(attrs={'class': 'form-control'}),
            'account_type': forms.Select(attrs={'class': 'form-control'}), # This will use the choices from the model
            'statement_category': forms.TextInput(attrs={'class': 'form-control'}),
            'hierarchy_level_1': forms.TextInput(attrs={'class': 'form-control'}),
            'hierarchy_level_2': forms.TextInput(attrs={'class': 'form-control'}),
            'hierarchy_level_3': forms.TextInput(attrs={'class': 'form-control'}),
            'hierarchy_level_4': forms.TextInput(attrs={'class': 'form-control'}),
            'parent_account': forms.Select(attrs={'class': 'form-control'}),
            'is_leaf': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'active_flag': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'display_order': forms.NumberInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['parent_account'].queryset = Account.objects.order_by('account_code')

class AccountUploadForm(forms.Form):
    """A simple form to handle the CSV file upload for the Chart of Accounts."""
    csv_file = forms.FileField(
        label='Select Chart of Accounts CSV File',
        help_text='File must match the format of the downloadable template.'
    )

class DateDimensionForm(forms.ModelForm):
    """Form for creating and updating DateDimension records."""
    class Meta:
        model = DateDimension
        fields = '__all__'
        widgets = {
            'full_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'day': forms.NumberInput(attrs={'class': 'form-control'}),
            'week_of_year': forms.NumberInput(attrs={'class': 'form-control'}),
            'month': forms.NumberInput(attrs={'class': 'form-control'}),
            'month_name': forms.TextInput(attrs={'class': 'form-control'}),
            'short_month_name': forms.TextInput(attrs={'class': 'form-control'}),
            'quarter': forms.NumberInput(attrs={'class': 'form-control'}),
            'quarter_name': forms.TextInput(attrs={'class': 'form-control'}),
            'year': forms.NumberInput(attrs={'class': 'form-control'}),
            'year_month': forms.TextInput(attrs={'class': 'form-control'}),
            'year_quarter': forms.TextInput(attrs={'class': 'form-control'}),
        }

class DateDimensionUploadForm(forms.Form):
    """A simple form to handle the CSV file upload for the Date Dimension."""
    csv_file = forms.FileField(
        label='Select Date Dimension CSV File',
        help_text='File must match the format of the downloadable template.'
    )

class CustomUserCreationForm(UserCreationForm):
    """
    Custom registration form based on Django's UserCreationForm.
    """
    class Meta:
        model = CustomUser
        # Use first_name, last_name, email, and username/password for creation
        fields = ('username', 'first_name', 'last_name', 'email', 'department', 'grade', 'phone_no')