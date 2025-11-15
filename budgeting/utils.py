from datetime import date
from django.conf import settings
from django.db.models import Sum, Q
from django.db import transaction
from .models import GLTransaction, FinancialRecord, Account, Scenario

FISCAL_START_MONTH = settings.FISCAL_YEAR_START_MONTH

def get_current_fiscal_year(today=None):
    """
    Determines the current fiscal year based on the October 1st start date.
    A fiscal year runs from Oct (M:10) of year Y to Sep (M:9) of year Y+1.
    """
    if today is None:
        today = date.today()
    
    current_year = today.year
    current_month = today.month
    
    if current_month >= FISCAL_START_MONTH:
        # The fiscal year started in the current calendar year
        fiscal_year = current_year
    else:
        # The fiscal year started in the previous calendar year
        fiscal_year = current_year - 1
        
    return fiscal_year

def get_fiscal_months(fiscal_year):
    """Generates a list of (month, year) tuples for a given fiscal year."""
    months = []
    # Oct, Nov, Dec of the start year
    for month in range(FISCAL_START_MONTH, 13):
        months.append((month, fiscal_year))
    # Jan through Sep of the end year
    for month in range(1, FISCAL_START_MONTH):
        months.append((month, fiscal_year + 1))
    return months

def aggregate_historical_data(fiscal_year, cutoff_date=None):
    """
    Aggregates raw GLTransaction data into monthly FinancialRecords up to the cutoff date.
    This creates/updates ACTUAL records in the FinancialRecord table.
    """
    if cutoff_date is None:
        cutoff_date = date.today()
        
    # Get the 'ACTUAL' scenario instance
    try:
        actual_scenario = Scenario.objects.get(scenario_name='ACTUAL')
    except Scenario.DoesNotExist:
        print("Error: 'ACTUAL' Scenario not defined.")
        return 0

    # 1. Filter GL transactions for the fiscal year up to the cutoff date
    # Determine the fiscal year end date for the filter query
    start_date = date(fiscal_year, FISCAL_START_MONTH, 1)
    
    # We only care about transactions that occurred up to the cutoff date
    transactions_to_aggregate = GLTransaction.objects.filter(
        transaction_date__gte=start_date,
        transaction_date__lte=cutoff_date,
        scenario=actual_scenario # Should always be ACTUAL for GL data
    )

    # 2. Group by month, year, account, and fund
    monthly_totals = transactions_to_aggregate.values(
        'fund', 'account', 'state', 'sector'
    ).annotate(
        # Extract the year and month from the transaction date for grouping
        month=models.functions.ExtractMonth('transaction_date'),
        year=models.functions.ExtractYear('transaction_date'),
        total_value=Sum('transaction_amount')
    )

    records_created = 0
    records_updated = 0
    
    # 3. Create or update FinancialRecord objects
    with transaction.atomic():
        for item in monthly_totals:
            # Determine the fiscal year for the grouped month/year
            current_month = item['month']
            current_year = item['year']
            
            # Adjust the stored year to be the fiscal year start year
            if current_month < FISCAL_START_MONTH:
                record_fiscal_year = current_year - 1
            else:
                record_fiscal_year = current_year

            # Find or create the FinancialRecord
            record, created = FinancialRecord.objects.update_or_create(
                account_id=item['account'],
                fund_id=item['fund'],
                state_id=item['state'],
                sector_id=item['sector'],
                year=record_fiscal_year,
                month=current_month,
                scenario=actual_scenario,
                defaults={
                    'value': item['total_value'],
                    'is_editable': False # Actuals are never editable
                }
            )
            if created:
                records_created += 1
            else:
                records_updated += 1

    return records_created + records_updated


def initialize_forecast_data(fiscal_year, actual_cutoff_month, actual_cutoff_year, forecast_scenario_name='FORECAST'):
    """
    Initializes FinancialRecord entries for months in the fiscal year 
    that fall after the last actual month. Uses a simple estimate (e.g., 
    last actual month's value or 0).
    """
    # Get the 'FORECAST' scenario instance
    try:
        forecast_scenario = Scenario.objects.get(scenario_name=forecast_scenario_name)
    except Scenario.DoesNotExist:
        print(f"Error: '{forecast_scenario_name}' Scenario not defined.")
        return 0

    all_fiscal_months = get_fiscal_months(fiscal_year)
    
    forecast_months = []
    # Find months that are *after* the actual cutoff
    found_cutoff = False
    for month, year in all_fiscal_months:
        if found_cutoff:
            forecast_months.append((month, year))
        elif month == actual_cutoff_month and year == actual_cutoff_year:
            found_cutoff = True
            
    # Simple initialization logic: replicate the final actual month's data
    # (In a real app, this would use sophisticated forecasting models)
    
    # 1. Get the list of all unique slices (Account, Fund, State, Sector)
    unique_slices = FinancialRecord.objects.filter(
        year=fiscal_year,
        scenario__scenario_name='ACTUAL'
    ).values('account', 'fund', 'state', 'sector').distinct()
    
    records_to_create = []

    # 2. Iterate through each slice and each forecast month
    for slice_data in unique_slices:
        # Try to find the last actual value for this slice
        try:
            last_actual_record = FinancialRecord.objects.filter(
                account_id=slice_data['account'],
                fund_id=slice_data['fund'],
                state_id=slice_data['state'],
                sector_id=slice_data['sector'],
                year__lte=actual_cutoff_year,
                month__lte=actual_cutoff_month,
                scenario__scenario_name='ACTUAL'
            ).order_by('-year', '-month').first()
            
            initial_value = last_actual_record.value if last_actual_record else 0.00
        except Exception:
            initial_value = 0.00
        
        # Create forecast records for all future months
        for month, year in forecast_months:
            # Use update_or_create to prevent duplicates if initialization runs again
            FinancialRecord.objects.update_or_create(
                account_id=slice_data['account'],
                fund_id=slice_data['fund'],
                state_id=slice_data['state'],
                sector_id=slice_data['sector'],
                year=fiscal_year,
                month=month,
                scenario=forecast_scenario,
                defaults={
                    'value': initial_value,
                    'is_editable': True 
                }
            )

    return len(forecast_months) * len(unique_slices) # approximate count