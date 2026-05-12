import csv
import random
from datetime import datetime, timedelta

def generate_strategic_plan_data(num_records):
    """
    Generates a list of dictionaries containing realistic strategic plan data for Kisumu County.
    The data is structured to match the provided template and includes new columns.
    """
    # Lists for new and updated columns
    subcounties = ['Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach']
    wards = ['Konya', 'Kolwa East', 'Milimani', 'Kondele', 'Maseno', 'Manyatta B', 'Ahero', 'Awasi']
    
    # Using updated Kisumu County departments from the previous Canvas
    departments = [
        'Medical Services, Public Health and Sanitation',
        'Agriculture, Fisheries, Livestock Development and Irrigation',
        'Education, Technical Training, Innovation and Social Services',
        'Water, Environment, Natural Resources and Climate Change',
        'Finance, Economic Planning and ICT(E-Government) Services',
        'Trade, Tourism, Industry and Marketing',
        'Sports, Culture, Gender and Youth Affairs',
        'City of Kisumu Management',
        'Public Service, County Administration',
        'Infrastructure, Energy and Public Works',
        'Lands, Housing, Urban Planning and Physical Planning'
    ]
    
    project_categories = ['Public Health Initiative', 'Infrastructure', 'Education', 'Economic Empowerment', 'Sanitation']
    
    # Base lists for other fields
    plan_names = ['Kisumu Urban Strategic Plan', 'County Vision 2029', 'Five-Year Development Plan']
    program_departments = ['Public Health', 'Environmental Health', 'Water & Sanitation', 'Education']
    
    data = []
    
    for i in range(1, num_records + 1):
        plan_cidpid = f'KISUMU-2024-{i:03d}'
        plan_start_date = datetime(2024, 7, 1)
        plan_end_date = datetime(2029, 6, 30)
        
        # Select random values for each row
        department = random.choice(departments)
        subcounty = random.choice(subcounties)
        ward = random.choice(wards)
        project_category = random.choice(project_categories)
        
        # Generate project, milestone, and activity names
        project_name = f'Project {i:02d} in {subcounty}'
        milestone_name = f'Milestone {random.randint(1, 5)} for {project_name}'
        
        activity_start_date = datetime(2024, random.randint(7, 12), random.randint(1, 28))
        activity_end_date = activity_start_date + timedelta(days=random.randint(30, 90))
        milestone_due_date = activity_end_date + timedelta(days=random.randint(1, 15))
        
        activity_name = f'Activity {random.randint(1, 10)} for {project_name}'
        
        record = {
            'Plan_CIDPID': plan_cidpid,
            'Plan_Name': random.choice(plan_names),
            'Plan_StartDate': plan_start_date.strftime('%Y-%m-%d'),
            'Plan_EndDate': plan_end_date.strftime('%Y-%m-%d'),
            'Program_Name': f'Program {i}',
            'Program_Department': random.choice(program_departments),
            'Program_Section': f'Section {i}',
            'Program_NeedsPriorities': 'High prevalence of diseases; inadequate infrastructure.',
            'Program_Strategies': 'Implement community-led programs.',
            'Program_Objectives': 'Reduced disease incidence; Improved infrastructure.',
            'Program_Outcomes': 'A healthier urban environment.',
            'Program_Remarks': 'Partnerships with local clinics and NGOs.',
            'Subprogram_Name': f'Subprogram {i}',
            'Subprogram_KeyOutcome': f'Improved {department} services',
            'Subprogram_KPI': 'Service rate (%)',
            'Subprogram_Baseline': random.randint(50, 80),
            'Subprogram_Yr1Targets': random.randint(81, 90),
            'Subprogram_Yr2Targets': random.randint(91, 95),
            'Subprogram_Yr3Targets': random.randint(96, 100),
            'Subprogram_Yr4Targets': 100,
            'Subprogram_Yr5Targets': 100,
            'Subprogram_Yr1Budget': random.randint(1000000, 5000000),
            'Subprogram_Yr2Budget': random.randint(5000000, 10000000),
            'Subprogram_Yr3Budget': random.randint(10000000, 20000000),
            'Subprogram_Yr4Budget': random.randint(20000000, 30000000),
            'Subprogram_Yr5Budget': random.randint(30000000, 50000000),
            'Subprogram_TotalBudget': random.randint(100000000, 200000000),
            'Subprogram_Remarks': 'Community training and deployment.',
            'Workplan_Name': f'FY 2024/2025 {department} Workplan',
            'Workplan_FinancialYear': '2024/2025',
            'Workplan_TotalBudget': random.randint(5000000, 15000000),
            'Project_Name': project_name,
            'Project_Category': project_category,
            'Project_Cost': random.randint(1000000, 5000000),
            'Milestone_Name': milestone_name,
            'Milestone_DueDate': milestone_due_date.strftime('%Y-%m-%d'),
            'Activity_Name': activity_name,
            'Activity_StartDate': activity_start_date.strftime('%Y-%m-%d'),
            'Activity_EndDate': activity_end_date.strftime('%Y-%m-%d'),
            'Activity_BudgetAllocated': random.randint(100000, 500000),
            # New columns
            'Subcounty': subcounty,
            'Ward': ward,
            'Department': department,
        }
        data.append(record)
        
    return data

def save_to_csv(data, filename):
    """Saves the generated data to a CSV file."""
    if not data:
        print("No data to save.")
        return

    # Dynamically get headers from the first record
    headers = list(data[0].keys())
    
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
    print(f"Successfully generated and saved {len(data)} records to '{filename}'.")

if __name__ == '__main__':
    test_data = generate_strategic_plan_data(25)
    
    # You can change the filename if needed
    save_to_csv(test_data, 'kisumu_test_data.csv')

