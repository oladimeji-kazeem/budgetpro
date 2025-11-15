from django.urls import path
from . import views

app_name = 'budgeting'

urlpatterns = [
    # Home Page / Dashboard
    path('', views.home, name='home'),
    
    # Registration
    path('register/', views.register, name='register'),

    # Data Import (Phase 2.1)
    path('upload/gl/', views.upload_gl_data, name='upload_gl'),
    path('upload/gl/template/', views.download_gl_template, name='download_gl_template'),
    
    # User Profile (New Feature)
    path('profile/', views.user_profile, name='profile'),

    # --- Module URLs ---
    path('module/historical-data/', views.historical_data, name='historical_data'),
    
    # Placeholder URLs for modules under development
    path('module/aum-details/', lambda request: views.placeholder_view(request, 'aum_details'), name='aum_details'),
    path('module/hod-submission/', lambda request: views.placeholder_view(request, 'hod_submission'), name='hod_submission'),
    path('module/final-forecast/', lambda request: views.placeholder_view(request, 'final_forecast'), name='final_forecast'),
    path('module/performance-management/', lambda request: views.placeholder_view(request, 'performance_management'), name='performance_management'),

    # --- CRUD URLs for Setup Tables ---
    # Example for Departments
    path('setup/departments/', views.DepartmentListView.as_view(), name='department_list'),
    path('setup/departments/new/', views.DepartmentCreateView.as_view(), name='department_create'),
    path('setup/departments/<int:pk>/edit/', views.DepartmentUpdateView.as_view(), name='department_update'),
    path('setup/departments/<int:pk>/delete/', views.DepartmentDeleteView.as_view(), name='department_delete'),

    # CRUD URLs for Funds
    path('setup/funds/', views.FundListView.as_view(), name='fund_list'),
    path('setup/funds/new/', views.FundCreateView.as_view(), name='fund_create'),
    path('setup/funds/<int:pk>/edit/', views.FundUpdateView.as_view(), name='fund_update'),
    path('setup/funds/<int:pk>/delete/', views.FundDeleteView.as_view(), name='fund_delete'),

    # CRUD URLs for Sectors
    path('setup/sectors/', views.SectorListView.as_view(), name='sector_list'),
    path('setup/sectors/new/', views.SectorCreateView.as_view(), name='sector_create'),
    path('setup/sectors/<int:pk>/edit/', views.SectorUpdateView.as_view(), name='sector_update'),
    path('setup/sectors/<int:pk>/delete/', views.SectorDeleteView.as_view(), name='sector_delete'),

    # CRUD URLs for Grades
    path('setup/grades/', views.GradeListView.as_view(), name='grade_list'),
    path('setup/grades/new/', views.GradeCreateView.as_view(), name='grade_create'),
    path('setup/grades/<int:pk>/edit/', views.GradeUpdateView.as_view(), name='grade_update'),
    path('setup/grades/<int:pk>/delete/', views.GradeDeleteView.as_view(), name='grade_delete'),

    # CRUD URLs for Scenarios
    path('setup/scenarios/', views.ScenarioListView.as_view(), name='scenario_list'),
    path('setup/scenarios/new/', views.ScenarioCreateView.as_view(), name='scenario_create'),
    path('setup/scenarios/<int:pk>/edit/', views.ScenarioUpdateView.as_view(), name='scenario_update'),
    path('setup/scenarios/<int:pk>/delete/', views.ScenarioDeleteView.as_view(), name='scenario_delete'),

    # CRUD URLs for Fund Categories
    path('setup/fund-categories/', views.FundCategoryListView.as_view(), name='fundcategory_list'),
    path('setup/fund-categories/new/', views.FundCategoryCreateView.as_view(), name='fundcategory_create'),
    path('setup/fund-categories/<int:pk>/edit/', views.FundCategoryUpdateView.as_view(), name='fundcategory_update'),
    path('setup/fund-categories/<int:pk>/delete/', views.FundCategoryDeleteView.as_view(), name='fundcategory_delete'),

    # CRUD URLs for Regions
    path('setup/regions/', views.RegionListView.as_view(), name='region_list'),
    path('setup/regions/new/', views.RegionCreateView.as_view(), name='region_create'),
    path('setup/regions/<int:pk>/edit/', views.RegionUpdateView.as_view(), name='region_update'),
    path('setup/regions/<int:pk>/delete/', views.RegionDeleteView.as_view(), name='region_delete'),

    # CRUD URLs for States
    path('setup/states/', views.StateListView.as_view(), name='state_list'),
    path('setup/states/new/', views.StateCreateView.as_view(), name='state_create'),
    path('setup/states/<int:pk>/edit/', views.StateUpdateView.as_view(), name='state_update'),
    path('setup/states/<int:pk>/delete/', views.StateDeleteView.as_view(), name='state_delete'),

    # CRUD URLs for Locations
    path('setup/locations/', views.LocationListView.as_view(), name='location_list'),
    path('setup/locations/new/', views.LocationCreateView.as_view(), name='location_create'),
    path('setup/locations/<int:pk>/edit/', views.LocationUpdateView.as_view(), name='location_update'),
    path('setup/locations/<int:pk>/delete/', views.LocationDeleteView.as_view(), name='location_delete'),

    # CRUD URLs for Accounts
    path('setup/accounts/', views.AccountListView.as_view(), name='account_list'),
    path('setup/accounts/new/', views.AccountCreateView.as_view(), name='account_create'),
    path('setup/accounts/<int:pk>/edit/', views.AccountUpdateView.as_view(), name='account_update'),
    path('setup/accounts/<int:pk>/delete/', views.AccountDeleteView.as_view(), name='account_delete'),
    path('setup/accounts/upload/', views.upload_accounts, name='upload_accounts'),
    path('setup/accounts/template/', views.download_account_template, name='download_account_template'),

    # Read-Only URL for GL Transactions
    path('data/gl-transactions/', views.GLTransactionListView.as_view(), name='gltransaction_list'),

    # CRUD URLs for Date Dimension
    path('setup/dates/', views.DateDimensionListView.as_view(), name='datedimension_list'),
    path('setup/dates/new/', views.DateDimensionCreateView.as_view(), name='datedimension_create'),
    path('setup/dates/<str:pk>/edit/', views.DateDimensionUpdateView.as_view(), name='datedimension_update'),
    path('setup/dates/<str:pk>/delete/', views.DateDimensionDeleteView.as_view(), name='datedimension_delete'),
    path('setup/dates/upload/', views.upload_dates, name='upload_dates'),
    path('setup/dates/template/', views.download_date_template, name='download_date_template'),

]