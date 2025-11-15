import csv
import io
from datetime import datetime
import http
from django.shortcuts import render, redirect
from django.urls import reverse, reverse_lazy
from django.contrib.auth import login
from django.contrib import messages
from django.db import transaction
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import ListView, CreateView, UpdateView, DeleteView

from .forms import GLUploadForm, ProfileUpdateForm, CustomUserCreationForm, FundForm, SectorForm, GradeForm, ScenarioForm, FundCategoryForm, RegionForm, StateForm, LocationForm, AccountForm, AccountUploadForm, DateDimensionForm, DateDimensionUploadForm
from .models import (
    GLTransaction, Account, Fund, Department, State, Sector, Scenario, Grade, FundCategory, Region, Location, DateDimension,
    FinancialRecord, CustomUser
)

@login_required
def home(request):
    """
    Renders the main application dashboard.
    """
    last_import = GLTransaction.objects.order_by('-transaction_date').first()
    context = {
        'current_fiscal_year': datetime.now().year,
        'last_gl_import_date': last_import.transaction_date if last_import else None,
        'total_funds': Fund.objects.count(),
    }
    return render(request, 'budgeting/dashboard.html', context)

# Custom decorator for privileged users (e.g., Finance team/Admin)
def is_privileged_user(user):
    # This is a placeholder for your actual permission logic
    return user.is_staff 

@login_required
@user_passes_test(is_privileged_user)
def upload_gl_data(request):
    """
    Handles the upload of GL/Ledger data via CSV file. (Previous code)
    """
    # ... (GL Upload logic remains the same) ...
    if request.method == 'POST':
        form = GLUploadForm(request.POST, request.FILES)
        if form.is_valid():
            csv_file = request.FILES['csv_file']
            file_data = csv_file.read().decode('utf-8')
            csv_data = io.StringIO(file_data)
            reader = csv.DictReader(csv_data)
            
            transactions_to_create = []
            errors = []
            
            account_map = {acc.account_code: acc for acc in Account.objects.all()}
            fund_map = {f.fund_name: f for f in Fund.objects.all()}
            dept_map = {d.department_name: d for d in Department.objects.all()}
            state_map = {s.state_name: s for s in State.objects.all()}
            sector_map = {s.sector_name: s for s in Sector.objects.all()}

            try:
                actual_scenario = Scenario.objects.get(scenario_name='ACTUAL')
            except Scenario.DoesNotExist:
                messages.error(request, "Setup Error: 'ACTUAL' Scenario not found in Settings. Please create it first.")
                return render(request, 'budgeting/upload_gl.html', {'form': form})
            
            for i, row in enumerate(reader):
                try:
                    account = account_map.get(row['Account Code'])
                    fund = fund_map.get(row['Fund Name'])
                    department = dept_map.get(row['Department'])
                    state = state_map.get(row['State'])
                    sector = sector_map.get(row['Sector'])
                    
                    if not all([account, fund, department, state, sector]):
                        missing_dims = []
                        if not account: missing_dims.append(f"Account Code: {row['Account Code']}")
                        if not fund: missing_dims.append(f"Fund Name: {row['Fund Name']}")
                        if not department: missing_dims.append(f"Department: {row['Department']}")
                        if not state: missing_dims.append(f"State: {row['State']}")
                        if not sector: missing_dims.append(f"Sector: {row['Sector']}")
                        raise ValueError(f"Missing Dimension Lookup: {'; '.join(missing_dims)}")

                    trans_date = datetime.strptime(row['Date'], '%Y-%m-%d').date() 
                    amount = float(row['Amount'])
                    
                    transactions_to_create.append(
                        GLTransaction(
                            transaction_date=trans_date,
                            account=account,
                            fund=fund,
                            department=department,
                            state=state,
                            sector=sector,
                            scenario=actual_scenario, 
                            description=row.get('Description', 'Imported GL Entry'),
                            transaction_amount=amount,
                            balance=0.00 
                        )
                    )
                
                except Exception as e:
                    errors.append(f"Row {i + 1}: Could not process row. Error: {e}")

            if errors:
                error_summary = "\n".join(errors[:10])
                messages.error(request, f"Upload failed due to data errors ({len(errors)} errors found). Top 10 errors:\n{error_summary}")
                return render(request, 'budgeting/upload_gl.html', {'form': form})

            with transaction.atomic():
                GLTransaction.objects.bulk_create(transactions_to_create)
            
            messages.success(request, f"Successfully imported {len(transactions_to_create)} GL transactions.")
            return redirect(reverse('budgeting:upload_gl'))
    
    else:
        form = GLUploadForm()

    return render(request, 'budgeting/upload_gl.html', {'form': form})

@login_required
@user_passes_test(is_privileged_user)
def download_gl_template(request):
    """Generates and serves a CSV template for GL data uploads."""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="gl_upload_template.csv"'

    writer = csv.writer(response)
    # Write the header row
    writer.writerow(['Date', 'Account Code', 'Fund Name', 'Department', 'State', 'Sector', 'Amount', 'Description'])
    
    return response

@login_required
@user_passes_test(is_privileged_user)
def download_account_template(request):
    """Generates and serves a CSV template for Chart of Accounts uploads."""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="chart_of_accounts_template.csv"'

    writer = csv.writer(response)
    # Write the header row based on the model fields
    header = [
        'AccountCode', 'AccountName', 'AccountType', 'StatementCategory', 
        'HierarchyLevel1', 'HierarchyLevel2', 'HierarchyLevel3', 'HierarchyLevel4',
        'ParentAccountCode', 'IsLeaf', 'DisplayOrder', 'ActiveFlag'
    ]
    writer.writerow(header)
    
    return response

@login_required
@user_passes_test(is_privileged_user)
def upload_accounts(request):
    """Handles the bulk upload of Chart of Accounts data from a CSV file."""
    if request.method == 'POST':
        form = AccountUploadForm(request.POST, request.FILES)
        if form.is_valid():
            csv_file = request.FILES['csv_file']
            file_data = csv_file.read().decode('utf-8')
            csv_data = io.StringIO(file_data)
            reader = csv.DictReader(csv_data)
            
            errors = []
            accounts_to_process = []

            for i, row in enumerate(reader):
                try:
                    accounts_to_process.append(row)
                except Exception as e:
                    errors.append(f"Row {i + 2}: Error reading row - {e}")

            if errors:
                messages.error(request, f"Upload failed due to file read errors: {', '.join(errors)}")
                return redirect('budgeting:upload_accounts')

            try:
                with transaction.atomic():
                    for row in accounts_to_process:
                        parent = None
                        if row.get('ParentAccountCode'):
                            parent = Account.objects.get(account_code=row['ParentAccountCode'])

                        Account.objects.update_or_create(
                            account_code=row['AccountCode'],
                            defaults={
                                'account_name': row['AccountName'],
                                'account_type': row['AccountType'],
                                'statement_category': row['StatementCategory'],
                                'hierarchy_level_1': row.get('HierarchyLevel1'),
                                'hierarchy_level_2': row.get('HierarchyLevel2'),
                                'hierarchy_level_3': row.get('HierarchyLevel3'),
                                'hierarchy_level_4': row.get('HierarchyLevel4'),
                                'parent_account': parent,
                                'is_leaf': row['IsLeaf'].strip().upper() in ['TRUE', '1', 'YES'],
                                'display_order': int(row['DisplayOrder']),
                                'active_flag': row['ActiveFlag'].strip().upper() in ['TRUE', '1', 'YES'],
                            }
                        )
                messages.success(request, f"Successfully processed {len(accounts_to_process)} account records.")
            except Exception as e:
                messages.error(request, f"An error occurred during processing: {e}")
            
            return redirect('budgeting:account_list')
    else:
        form = AccountUploadForm()
    
    return render(request, 'budgeting/upload_accounts.html', {'form': form})

@login_required
@user_passes_test(is_privileged_user)
def download_date_template(request):
    """Generates and serves a CSV template for Date Dimension uploads."""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="date_dimension_template.csv"'

    writer = csv.writer(response)
    header = [
        'FullDate', 'Day', 'WeekOfYear', 'Month', 'MonthName', 'ShortMonthName',
        'Quarter', 'QuarterName', 'Year', 'YearMonth', 'YearQuarter'
    ]
    writer.writerow(header)
    
    return response

@login_required
@user_passes_test(is_privileged_user)
def upload_dates(request):
    """Handles the bulk upload of Date Dimension data from a CSV file."""
    if request.method == 'POST':
        form = DateDimensionUploadForm(request.POST, request.FILES)
        if form.is_valid():
            csv_file = request.FILES['csv_file']
            file_data = csv_file.read().decode('utf-8')
            csv_data = io.StringIO(file_data)
            reader = csv.DictReader(csv_data)
            
            try:
                with transaction.atomic():
                    for row in reader:
                        DateDimension.objects.update_or_create(
                            full_date=row['FullDate'],
                            defaults={
                                'day': row['Day'],
                                'week_of_year': row['WeekOfYear'],
                                'month': row['Month'],
                                'month_name': row['MonthName'],
                                'short_month_name': row['ShortMonthName'],
                                'quarter': row['Quarter'],
                                'quarter_name': row['QuarterName'],
                                'year': row['Year'],
                                'year_month': row['YearMonth'],
                                'year_quarter': row['YearQuarter'],
                            }
                        )
                messages.success(request, "Successfully processed the Date Dimension file.")
            except Exception as e:
                messages.error(request, f"An error occurred during processing: {e}")
            
            return redirect('budgeting:datedimension_list')
    else:
        form = DateDimensionUploadForm()
    
    return render(request, 'budgeting/upload_dates.html', {'form': form})

@login_required
def user_profile(request):
    """
    Allows the authenticated user to view and update their profile information.
    """
    user = request.user
    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile was successfully updated!')
            return redirect(reverse('budgeting:profile'))
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = ProfileUpdateForm(instance=user)
        
    context = {
        'form': form,
        'user': user,
    }
    return render(request, 'budgeting/profile.html', context)


def register(request):
    """
    Handles new user registration.
    """
    if request.user.is_authenticated:
        return redirect(reverse('budgeting:home'))

    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False # Deactivate account until approved
            user.save()
            return render(request, 'registration/registration_success.html')
    else:
        form = CustomUserCreationForm()
    return render(request, 'registration/register.html', {'form': form})

@login_required
def historical_data(request):
    """
    Renders the Module 1: Historical Data & Editable Forecasts page.
    """
    # Basic context to render the template without errors.
    # A full implementation would calculate these values.
    context = {
        'fiscal_year': datetime.now().year,
        'today_month': datetime.now().month,
        'today_year': datetime.now().year,
        'is_privileged': is_privileged_user(request.user),
        'fiscal_months': [(m, datetime.now().year) for m in range(1, 13)],
        'report_data': [], # Placeholder for actual data
    }
    return render(request, 'budgeting/historical_data.html', context)


@login_required
def placeholder_view(request, module_name):
    """
    A generic view to render a 'Coming Soon' page for modules under development.
    """
    descriptions = {
        'aum_details': "Track and forecast Assets Under Management (AUM) based on various drivers.",
        'hod_submission': "Allow Heads of Department to submit their annual budget requests.",
        'final_forecast': "Consolidate departmental budgets into a final, multi-year financial forecast.",
        'performance_management': "Analyze budget vs. actual performance and other key metrics.",
    }
    
    context = {
        'module_name': module_name.replace('_', ' ').title(),
        'module_description': descriptions.get(module_name, "This module is currently being planned.")
    }
    return render(request, 'budgeting/placeholder.html', context)

# --- CRUD Views for Setup Tables ---

class DepartmentListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    """Lists all departments."""
    model = Department
    template_name = 'budgeting/department_list.html'
    context_object_name = 'departments'

    def test_func(self): return is_privileged_user(self.request.user)

class DepartmentCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    """View to create a new department."""
    model = Department
    fields = ['department_name']
    template_name = 'budgeting/department_form.html'
    success_url = reverse_lazy('budgeting:department_list')

    def test_func(self): return is_privileged_user(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Department'
        return context

class DepartmentUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    """View to update an existing department."""
    model = Department
    fields = ['department_name']
    template_name = 'budgeting/department_form.html'
    success_url = reverse_lazy('budgeting:department_list')

    def test_func(self): return is_privileged_user(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Department'
        return context

class DepartmentDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    """View to confirm and handle deletion of a department."""
    model = Department
    template_name = 'budgeting/department_confirm_delete.html'
    success_url = reverse_lazy('budgeting:department_list')

    def test_func(self): return is_privileged_user(self.request.user)

# --- CRUD for Sectors ---
class SectorListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Sector
    template_name = 'budgeting/sector_list.html'
    context_object_name = 'sectors'
    def test_func(self): return is_privileged_user(self.request.user)

class SectorCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Sector
    form_class = SectorForm
    template_name = 'budgeting/sector_form.html'
    success_url = reverse_lazy('budgeting:sector_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Sector'
        return context

class SectorUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Sector
    form_class = SectorForm
    template_name = 'budgeting/sector_form.html'
    success_url = reverse_lazy('budgeting:sector_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Sector'
        return context

class SectorDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Sector
    template_name = 'budgeting/sector_confirm_delete.html'
    success_url = reverse_lazy('budgeting:sector_list')
    def test_func(self): return is_privileged_user(self.request.user)


# --- CRUD for Grades ---
class GradeListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Grade
    template_name = 'budgeting/grade_list.html'
    context_object_name = 'grades'
    def test_func(self): return is_privileged_user(self.request.user)

class GradeCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Grade
    form_class = GradeForm
    template_name = 'budgeting/grade_form.html'
    success_url = reverse_lazy('budgeting:grade_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Grade'
        return context

class GradeUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Grade
    form_class = GradeForm
    template_name = 'budgeting/grade_form.html'
    success_url = reverse_lazy('budgeting:grade_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Grade'
        return context

class GradeDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Grade
    template_name = 'budgeting/grade_confirm_delete.html'
    success_url = reverse_lazy('budgeting:grade_list')
    def test_func(self): return is_privileged_user(self.request.user)


# --- CRUD for Scenarios ---
class ScenarioListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Scenario
    template_name = 'budgeting/scenario_list.html'
    context_object_name = 'scenarios'
    def test_func(self): return is_privileged_user(self.request.user)

class ScenarioCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Scenario
    form_class = ScenarioForm
    template_name = 'budgeting/scenario_form.html'
    success_url = reverse_lazy('budgeting:scenario_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Scenario'
        return context

class ScenarioUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Scenario
    form_class = ScenarioForm
    template_name = 'budgeting/scenario_form.html'
    success_url = reverse_lazy('budgeting:scenario_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Scenario'
        return context

class ScenarioDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Scenario
    template_name = 'budgeting/scenario_confirm_delete.html'
    success_url = reverse_lazy('budgeting:scenario_list')
    def test_func(self): return is_privileged_user(self.request.user)


class FundListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    """Lists all funds."""
    model = Fund
    template_name = 'budgeting/fund_list.html'
    context_object_name = 'funds'

    def test_func(self):
        return is_privileged_user(self.request.user)


# --- CRUD for Date Dimension ---
class DateDimensionListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = DateDimension
    template_name = 'budgeting/datedimension_list.html'
    context_object_name = 'dates'
    paginate_by = 31
    def test_func(self): return is_privileged_user(self.request.user)

class DateDimensionCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = DateDimension
    form_class = DateDimensionForm
    template_name = 'budgeting/datedimension_form.html'
    success_url = reverse_lazy('budgeting:datedimension_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Date Entry'
        return context

class DateDimensionUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = DateDimension
    form_class = DateDimensionForm
    template_name = 'budgeting/datedimension_form.html'
    success_url = reverse_lazy('budgeting:datedimension_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Date Entry'
        return context

class DateDimensionDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = DateDimension
    template_name = 'budgeting/datedimension_confirm_delete.html'
    success_url = reverse_lazy('budgeting:datedimension_list')
    def test_func(self): return is_privileged_user(self.request.user)


# --- CRUD for Accounts ---
class AccountListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Account
    template_name = 'budgeting/account_list.html'
    context_object_name = 'accounts'
    paginate_by = 25  # Add pagination for long lists
    def test_func(self): return is_privileged_user(self.request.user)

class AccountCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Account
    form_class = AccountForm
    template_name = 'budgeting/account_form.html'
    success_url = reverse_lazy('budgeting:account_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Account'
        return context

class AccountUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Account
    form_class = AccountForm
    template_name = 'budgeting/account_form.html'
    success_url = reverse_lazy('budgeting:account_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Account'
        return context

class AccountDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Account
    template_name = 'budgeting/account_confirm_delete.html'
    success_url = reverse_lazy('budgeting:account_list')
    def test_func(self): return is_privileged_user(self.request.user)


# --- Read-Only View for GL Transactions ---
class GLTransactionListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = GLTransaction
    template_name = 'budgeting/gltransaction_list.html'
    context_object_name = 'transactions'
    paginate_by = 50

    def test_func(self):
        return is_privileged_user(self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset().select_related('account', 'fund', 'department', 'scenario').order_by('-transaction_date')
        # Add search functionality
        query = self.request.GET.get('q')
        if query:
            queryset = queryset.filter(models.Q(description__icontains=query) | models.Q(account__account_name__icontains=query))
        return queryset


# --- CRUD for Regions ---
class RegionListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Region
    template_name = 'budgeting/region_list.html'
    context_object_name = 'regions'
    def test_func(self): return is_privileged_user(self.request.user)

class RegionCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Region
    form_class = RegionForm
    template_name = 'budgeting/region_form.html'
    success_url = reverse_lazy('budgeting:region_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Region'
        return context

class RegionUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Region
    form_class = RegionForm
    template_name = 'budgeting/region_form.html'
    success_url = reverse_lazy('budgeting:region_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Region'
        return context

class RegionDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Region
    template_name = 'budgeting/region_confirm_delete.html'
    success_url = reverse_lazy('budgeting:region_list')
    def test_func(self): return is_privileged_user(self.request.user)


# --- CRUD for States ---
class StateListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = State
    template_name = 'budgeting/state_list.html'
    context_object_name = 'states'
    def test_func(self): return is_privileged_user(self.request.user)

class StateCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = State
    form_class = StateForm
    template_name = 'budgeting/state_form.html'
    success_url = reverse_lazy('budgeting:state_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New State'
        return context

class StateUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = State
    form_class = StateForm
    template_name = 'budgeting/state_form.html'
    success_url = reverse_lazy('budgeting:state_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit State'
        return context

class StateDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = State
    template_name = 'budgeting/state_confirm_delete.html'
    success_url = reverse_lazy('budgeting:state_list')
    def test_func(self): return is_privileged_user(self.request.user)


# --- CRUD for Locations ---
class LocationListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = Location
    template_name = 'budgeting/location_list.html'
    context_object_name = 'locations'
    def test_func(self): return is_privileged_user(self.request.user)

class LocationCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Location
    form_class = LocationForm
    template_name = 'budgeting/location_form.html'
    success_url = reverse_lazy('budgeting:location_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Location'
        return context

class LocationUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Location
    form_class = LocationForm
    template_name = 'budgeting/location_form.html'
    success_url = reverse_lazy('budgeting:location_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Location'
        return context

class LocationDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Location
    template_name = 'budgeting/location_confirm_delete.html'
    success_url = reverse_lazy('budgeting:location_list')
    def test_func(self): return is_privileged_user(self.request.user)


# --- CRUD for Fund Categories ---
class FundCategoryListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    model = FundCategory
    template_name = 'budgeting/fundcategory_list.html'
    context_object_name = 'fund_categories'
    def test_func(self): return is_privileged_user(self.request.user)

class FundCategoryCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = FundCategory
    form_class = FundCategoryForm
    template_name = 'budgeting/fundcategory_form.html'
    success_url = reverse_lazy('budgeting:fundcategory_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Fund Category'
        return context

class FundCategoryUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = FundCategory
    form_class = FundCategoryForm
    template_name = 'budgeting/fundcategory_form.html'
    success_url = reverse_lazy('budgeting:fundcategory_list')
    def test_func(self): return is_privileged_user(self.request.user)
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Fund Category'
        return context

class FundCategoryDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = FundCategory
    template_name = 'budgeting/fundcategory_confirm_delete.html'
    success_url = reverse_lazy('budgeting:fundcategory_list')
    def test_func(self): return is_privileged_user(self.request.user)

class FundCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    """View to create a new fund."""
    model = Fund
    form_class = FundForm
    template_name = 'budgeting/fund_form.html'
    success_url = reverse_lazy('budgeting:fund_list')

    def test_func(self):
        return is_privileged_user(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Create New Fund'
        return context

class FundUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    """View to update an existing fund."""
    model = Fund
    form_class = FundForm
    template_name = 'budgeting/fund_form.html'
    success_url = reverse_lazy('budgeting:fund_list')

    def test_func(self):
        return is_privileged_user(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form_title'] = 'Edit Fund'
        return context

class FundDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    """View to confirm and handle deletion of a fund."""
    model = Fund
    template_name = 'budgeting/fund_confirm_delete.html'
    success_url = reverse_lazy('budgeting:fund_list')

    def test_func(self):
        return is_privileged_user(self.request.user)