from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser # Import for custom user
from phonenumber_field.modelfields import PhoneNumberField # Used for professional phone number handling

# --- DIMENSION MODELS (Master Data) ---

# Region, State, Location, Fund, Department, Sector, Scenario, and Account models 
# remain as previously defined, with Department now linked to CustomUser.

class Region(models.Model):
    """Corresponds to DimRegion. Groups of states/locations in Nigeria."""
    region_name = models.CharField(max_length=100, unique=True, verbose_name=_("Region Name"))
    class Meta:
        verbose_name = _("Region")
        verbose_name_plural = _("Regions")
    def __str__(self):
        return self.region_name

class State(models.Model):
    """Corresponds to DimState. States of Nigeria (which has several locations)."""
    state_name = models.CharField(max_length=100, unique=True, verbose_name=_("State Name"))
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name='states', verbose_name=_("Region"))
    class Meta:
        verbose_name = _("State")
        verbose_name_plural = _("States")
        ordering = ['state_name']
    def __str__(self):
        return f"{self.state_name} ({self.region.region_name})"

class Location(models.Model):
    """Corresponds to DimLocation. Branch locations."""
    location_name = models.CharField(max_length=100, unique=True, verbose_name=_("Location Name"))
    state = models.ForeignKey(State, on_delete=models.PROTECT, related_name='locations', verbose_name=_("State"))
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name='locations', 
                               verbose_name=_("Region"), editable=False)

    class Meta:
        verbose_name = _("Location (Branch)")
        verbose_name_plural = _("Locations (Branches)")

    def save(self, *args, **kwargs):
        self.region = self.state.region
        super().save(*args, **kwargs)

    def __str__(self):
        return self.location_name

class FundCategory(models.Model):
    """NEW: Groups funds into categories like 'Equity', 'Fixed Income', etc."""
    category_name = models.CharField(max_length=100, unique=True, verbose_name=_("Category Name"))

    class Meta:
        verbose_name = _("Fund Category")
        verbose_name_plural = _("Fund Categories")
        ordering = ['category_name']

    def __str__(self):
        return self.category_name

class Fund(models.Model):
    """Corresponds to DimFund. Includes Fund Category and specific Fund Name."""
    FUND_TYPE_CHOICES = [('MUTUAL', 'Mutual Funds'),('RSA', 'RSA Funds (PENCOM)'),]
    fund_type = models.CharField(max_length=50, choices=FUND_TYPE_CHOICES, verbose_name=_("Fund Type"))
    fund_name = models.CharField(max_length=100, unique=True, verbose_name=_("Fund Name"))
    fund_category = models.ForeignKey(FundCategory, on_delete=models.PROTECT, related_name='funds', verbose_name=_("Fund Category"), null=True)

    class Meta:
        verbose_name = _("Fund")
        verbose_name_plural = _("Funds")
        unique_together = ('fund_type', 'fund_name')

    def __str__(self):
        return f"[{self.get_fund_type_display()}] {self.fund_name}"

class Department(models.Model):
    """Corresponds to DimDepartment. Used for HOD budget submissions and User FK."""
    department_name = models.CharField(max_length=100, unique=True, verbose_name=_("Department Name"))
    class Meta:
        verbose_name = _("Department")
        verbose_name_plural = _("Departments")
    def __str__(self):
        return self.department_name

class Grade(models.Model):
    """NEW: Employee Grade/Level table for the Custom User model."""
    grade_name = models.CharField(max_length=50, unique=True, verbose_name=_("Grade/Level Name"))
    display_order = models.IntegerField(default=1, verbose_name=_("Display Order"))

    class Meta:
        verbose_name = _("Employee Grade")
        verbose_name_plural = _("Employee Grades")
        ordering = ['display_order']

    def __str__(self):
        return self.grade_name

class Sector(models.Model):
    """Corresponds to DimSector. Used for investment slicing (Module 5)."""
    sector_name = models.CharField(max_length=100, unique=True, verbose_name=_("Sector Name"))
    class Meta:
        verbose_name = _("Sector")
        verbose_name_plural = _("Sectors")
    def __str__(self):
        return self.sector_name

class Scenario(models.Model):
    """Corresponds to DimScenario. Used to tag budget versions (Actual, Draft, Final, Forecast)."""
    scenario_name = models.CharField(max_length=100, unique=True, verbose_name=_("Scenario Name"))
    class Meta:
        verbose_name = _("Scenario")
        verbose_name_plural = _("Scenarios")
    def __str__(self):
        return self.scenario_name

class Account(models.Model):
    """Corresponds to DimAccount (PENCOM Standard Chart of Accounts)."""
    account_key = models.BigAutoField(primary_key=True, verbose_name=_("Account Key"))
    ACCOUNT_TYPE_CHOICES = [('ASSET', 'Asset'),('LIABILITY', 'Liability'),('EQUITY', 'Equity'),('REVENUE', 'Revenue/Income'),('EXPENSE', 'Expense'),]
    account_code = models.CharField(max_length=20, unique=True, verbose_name=_("Account Code"))
    account_name = models.CharField(max_length=100, verbose_name=_("Account Name"))
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, verbose_name=_("Account Type"))
    statement_category = models.CharField(max_length=30, verbose_name=_("Statement Category (e.g., P&L, BS)"))
    hierarchy_level_1 = models.CharField(max_length=50, blank=True, null=True, verbose_name=_("Level 1"))
    hierarchy_level_2 = models.CharField(max_length=50, blank=True, null=True, verbose_name=_("Level 2"))
    hierarchy_level_3 = models.CharField(max_length=50, blank=True, null=True, verbose_name=_("Level 3"))
    hierarchy_level_4 = models.CharField(max_length=50, blank=True, null=True, verbose_name=_("Level 4"))
    parent_account = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,
                                       related_name='children', verbose_name=_("Parent Account"), to_field='account_key')
    display_order = models.IntegerField(default=0, verbose_name=_("Display Order"))
    is_leaf = models.BooleanField(default=True, verbose_name=_("Is Leaf Node"))
    active_flag = models.BooleanField(default=True, verbose_name=_("Is Active"))

    class Meta:
        verbose_name = _("Account (Chart of Account)")
        verbose_name_plural = _("Accounts (Chart of Accounts)")
        ordering = ['account_code']

    def __str__(self):
        return f"{self.account_code} - {self.account_name}"

class DateDimension(models.Model):
    """A standard date dimension table for slicing and dicing data by time."""
    full_date = models.DateField(primary_key=True, verbose_name=_("Full Date"))
    day = models.PositiveSmallIntegerField(verbose_name=_("Day"))
    week_of_year = models.PositiveSmallIntegerField(verbose_name=_("Week of Year"))
    month = models.PositiveSmallIntegerField(verbose_name=_("Month"))
    month_name = models.CharField(max_length=15, verbose_name=_("Month Name"))
    short_month_name = models.CharField(max_length=3, verbose_name=_("Short Month Name"))
    quarter = models.PositiveSmallIntegerField(verbose_name=_("Quarter"))
    quarter_name = models.CharField(max_length=10, verbose_name=_("Quarter Name"))
    year = models.PositiveSmallIntegerField(verbose_name=_("Year"))
    year_month = models.CharField(max_length=7, verbose_name=_("Year-Month (YYYY-MM)")) # e.g., 2024-01
    year_quarter = models.CharField(max_length=6, verbose_name=_("Year-Quarter (YYYY-Q#)")) # e.g., 2024-Q1

    class Meta:
        verbose_name = _("Date Dimension")
        verbose_name_plural = _("Date Dimensions")
        ordering = ['full_date']

    def __str__(self):
        return self.full_date.strftime('%Y-%m-%d')

# --- CUSTOM USER MODEL ---

class CustomUser(AbstractUser):
    """
    Custom user model including required fields and FKs to dimensions.
    """
    phone_no = PhoneNumberField(blank=True, null=True, verbose_name=_("Phone Number"))
    
    # Foreign Keys to Dimensions
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='users', verbose_name=_("Department"))
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True,
                              related_name='users', verbose_name=_("Grade/Level"))

    class Meta:
        verbose_name = _("User Profile")
        verbose_name_plural = _("User Profiles")

    def get_full_name(self):
        """Returns the first_name plus the last_name, with a space in between."""
        return f'{self.first_name} {self.last_name}'.strip()

# --- FACT MODELS (Transactional and Aggregated Data) ---

class GLTransaction(models.Model):
    """Corresponds to FactGLTransactions. ACTUAL data."""
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='transactions', verbose_name=_("GL Account"), to_field='account_key')
    fund = models.ForeignKey(Fund, on_delete=models.PROTECT, related_name='transactions', verbose_name=_("Fund"))
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='transactions', verbose_name=_("Department"))
    state = models.ForeignKey(State, on_delete=models.PROTECT, related_name='transactions', verbose_name=_("State"))
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT, related_name='transactions', verbose_name=_("Sector"))
    scenario = models.ForeignKey(Scenario, on_delete=models.PROTECT, related_name='transactions', verbose_name=_("Scenario (e.g., ACTUAL)"))
    transaction_date = models.DateField(verbose_name=_("Transaction Date"))
    description = models.CharField(max_length=255, verbose_name=_("Description"))
    transaction_amount = models.DecimalField(max_digits=18, decimal_places=2, default=0.00, verbose_name=_("Transaction Amount"))
    balance = models.DecimalField(max_digits=18, decimal_places=2, default=0.00, verbose_name=_("Running Balance"))

    class Meta:
        verbose_name = _("GL Transaction")
        verbose_name_plural = _("GL Transactions")

    def __str__(self):
        return f"[{self.transaction_date}] {self.account.account_code}: {self.transaction_amount}"

class FinancialRecord(models.Model):
    """Stores aggregated monthly values for Historical/Forecast/Budget."""
    account = models.ForeignKey(Account, on_delete=models.PROTECT, verbose_name=_("GL Account"), to_field='account_key')
    fund = models.ForeignKey(Fund, on_delete=models.PROTECT, verbose_name=_("Fund"))
    year = models.IntegerField(validators=[MinValueValidator(2000)], verbose_name=_("Fiscal Year"))
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)], verbose_name=_("Month"))
    scenario = models.ForeignKey(Scenario, on_delete=models.PROTECT, verbose_name=_("Scenario Type")) 
    value = models.DecimalField(max_digits=18, decimal_places=2, default=0.00, verbose_name=_("Value"))
    is_editable = models.BooleanField(default=False, verbose_name=_("Is Editable Forecast"))
    state = models.ForeignKey(State, on_delete=models.PROTECT, null=True, blank=True, verbose_name=_("State"))
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT, null=True, blank=True, verbose_name=_("Sector"))

    class Meta:
        verbose_name = _("Monthly Financial Record")
        verbose_name_plural = _("Monthly Financial Records")
        unique_together = ('account', 'fund', 'year', 'month', 'scenario', 'state', 'sector')
        ordering = ['year', 'month']

    def __str__(self):
        return f"{self.fund.fund_name} | {self.account.account_code} | {self.year}-{self.month} ({self.scenario.scenario_name})"