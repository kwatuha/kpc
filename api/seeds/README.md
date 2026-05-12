# Analytics Sample Data Seed Script

This seed script generates sample data for the Project Analytics page to demonstrate various analytics features.

## Overview

The seed script creates 150 sample projects with:
- **Multiple statuses**: Ongoing, Completed, At Risk, Delayed, Planning, On Hold, Cancelled
- **Various departments**: Ministry of Health, Education, Infrastructure, Agriculture, Water, Energy
- **Different sectors**: Infrastructure, Healthcare, Education, Agriculture, Water & Sanitation, Energy, Transport
- **Financial years**: 2020/2021 through 2024/2025
- **Realistic budgets**: 500K to 50M KES
- **Progress percentages**: Aligned with project statuses
- **Budget disbursements**: Calculated based on progress and status

## Features Demonstrated

The sample data enables you to see:

1. **Key Insights Dashboard**
   - Budget absorption rates
   - Completion rates
   - Average progress across departments
   - Budget variance analysis

2. **Project Trends**
   - Project counts over time
   - Completion trends
   - Financial trends by year

3. **Department Performance**
   - Projects per department
   - Budget allocation by department
   - Progress tracking
   - Budget utilization rates

4. **Status Distribution**
   - Projects by status (pie charts)
   - Budget allocation by status
   - Financial status by project status

5. **Risk Indicators**
   - Projects at risk (high spending, low progress)
   - Delayed projects
   - Budget overruns

6. **Performance Analysis**
   - Top performing departments
   - Underperforming departments
   - Budget efficiency metrics

## Usage

### Prerequisites

- Database connection configured in `.env`
- Database tables created (projects, departments, financialyears)

### Running the Seed Script

From the `api` directory:

```bash
# Using npm script
npm run seed:analytics

# Or directly with node
node seeds/seedAnalyticsData.js
```

### Important Notes

- The script checks for existing projects and will **skip seeding** if projects already exist
- This prevents accidental duplication of data
- If you want to re-seed, you'll need to clear existing projects first
- The script works with both PostgreSQL and MySQL databases (auto-detected from `DB_TYPE` env variable)

### Database Support

The script automatically detects and supports:
- **PostgreSQL**: Uses JSONB fields for timeline, budget, progress, etc.
- **MySQL**: Uses traditional column structure

## Sample Data Characteristics

### Status Distribution
- **Completed**: 10-15% of projects (95-100% progress, 90-100% budget spent)
- **Ongoing**: 40-50% of projects (20-80% progress, aligned spending)
- **At Risk**: 10-15% of projects (10-50% progress, 60-90% budget spent)
- **Delayed**: 10-15% of projects (5-40% progress, 40-70% budget spent)
- **Planning**: 10-15% of projects (0-15% progress, minimal spending)
- **On Hold/Cancelled**: 5-10% of projects

### Budget Distribution
- Budgets range from 500,000 to 50,000,000 KES
- Paid amounts are calculated based on status and progress
- Completed projects typically have 90-100% of budget disbursed
- At Risk projects show high spending relative to progress

### Time Distribution
- Projects span from 2020 to 2024
- Duration ranges from 6 to 36 months
- Distributed across all financial years

## Troubleshooting

### Script skips seeding
- This means you already have projects in the database
- Clear existing projects if you want fresh sample data

### Database connection errors
- Check your `.env` file has correct database credentials
- Ensure the database server is running
- Verify table structures match expected schema

### Missing departments or financial years
- The script will create missing departments and financial years automatically
- If creation fails, check database permissions

## Viewing the Data

After running the seed script:

1. Start your backend server: `npm start` or `npm run dev`
2. Start your frontend server
3. Navigate to the **Project Analytics** page
4. You should see all analytics features populated with sample data

## Customization

You can modify the seed script to:
- Change the number of projects generated
- Adjust budget ranges
- Add more departments or sectors
- Modify status distributions
- Add more financial years

Edit `api/seeds/seedAnalyticsData.js` to customize the sample data.
