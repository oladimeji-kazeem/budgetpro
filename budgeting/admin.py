from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Region, State, Location, Fund,
    Department, Sector, Scenario, Account, Grade, # AUMDriver, AUMRecord,
    GLTransaction, FinancialRecord, CustomUser
)
from django.utils.translation import gettext_lazy as _

# --- 0. Custom Admin User ---

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Custom Admin interface for managing CustomUser details."""
    model = CustomUser
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'department', 'grade', 'phone_no')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'department', 'grade')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone_no')

    # Define how fields are grouped in the user detail page
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'phone_no')}),
        (_('Organizational Details'), {'fields': ('department', 'grade')}), # New fields
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
# --- 1. Geographic Dimensions (Region, State, Location) ---
class StateInline(admin.TabularInline):
    model = State
    extra = 1

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('region_name',)
    search_fields = ('region_name',)
    inlines = [StateInline]
    verbose_name = "Regions"

class LocationInline(admin.TabularInline):
    model = Location
    extra = 1

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('state_name', 'region')
    list_filter = ('region',)
    search_fields = ('state_name',)
    inlines = [LocationInline]

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('location_name', 'state', 'region')
    list_filter = ('state__region', 'state') 
    search_fields = ('location_name', 'state__state_name')
    readonly_fields = ('region',) 

# --- 2. Financial & Organizational Dimensions ---

@admin.register(Fund)
class FundAdmin(admin.ModelAdmin):
    list_display = ('fund_name', 'fund_type', 'fund_category')
    list_filter = ('fund_type', 'fund_category')
    search_fields = ('fund_name', 'fund_category__category_name')

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_name',)
    search_fields = ('department_name',)

@admin.register(Grade) 
class GradeAdmin(admin.ModelAdmin):
    list_display = ('grade_name', 'display_order')
    list_editable = ('display_order',)
    ordering = ('display_order',)

@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('sector_name',)
    search_fields = ('sector_name',)

@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ('scenario_name',)
    search_fields = ('scenario_name',)

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = (
        'account_key', 'account_code', 'account_name', 'account_type', 'statement_category', 
        'parent_account', 'is_leaf', 'active_flag'
    )
    list_filter = ('account_type', 'statement_category', 'is_leaf', 'active_flag')
    search_fields = ('account_code', 'account_name', 'hierarchy_level_1')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('account_code', 'account_name', 'display_order', 'active_flag')
        }),
        ('Financial Structure', {
            'fields': ('account_type', 'statement_category', 'parent_account', 'is_leaf')
        }),
        ('Hierarchy Details', {
            'fields': (
                'hierarchy_level_1', 'hierarchy_level_2', 
                'hierarchy_level_3', 'hierarchy_level_4'
            ),
            'classes': ('collapse',),
        }),
    )

# --- 3. Module 2: AUM Management (New) --- (Commented out until models are defined)

# @admin.register(AUMDriver)
# class AUMDriverAdmin(admin.ModelAdmin):
#     list_display = ('name', 'driver_type')
#     list_filter = ('driver_type',)
#     search_fields = ('name', 'description')

# @admin.register(AUMRecord)
# class AUMRecordAdmin(admin.ModelAdmin):
#     list_display = ('year', 'month', 'fund', 'aum_driver', 'value', 'type', 'scenario', 'is_editable')
#     list_filter = ('scenario', 'type', 'fund', 'year')
#     search_fields = ('fund__fund_name', 'aum_driver__name')
#     fieldsets = (
#         (None, {
#             'fields': ('type', 'fund', 'aum_driver', 'scenario', 'is_editable')
#         }),
#         ('Time and Value', {
#             'fields': (('year', 'month'), 'value')
#         }),
#     )


# --- 4. Transactional/Fact Tables (Read-Only for Admin) ---
@admin.register(GLTransaction)
class GLTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_date', 'account', 'fund', 'transaction_amount', 'department', 'state', 'scenario')
    list_filter = ('scenario', 'fund', 'department', 'state')
    search_fields = ('account__account_code', 'description')
    readonly_fields = [f.name for f in GLTransaction._meta.fields] 
    date_hierarchy = 'transaction_date'

@admin.register(FinancialRecord)
class FinancialRecordAdmin(admin.ModelAdmin):
    list_display = ('year', 'month', 'account', 'fund', 'value', 'scenario', 'is_editable')
    list_filter = ('scenario', 'year', 'fund', 'is_editable')
    search_fields = ('account__account_code', 'account__account_name')