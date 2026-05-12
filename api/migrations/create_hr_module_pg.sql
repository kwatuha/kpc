-- HR module tables for PostgreSQL (snake_case columns; API layer camelizes for clients).
-- Run once: psql $DATABASE_URL -f api/migrations/create_hr_module_pg.sql

BEGIN;

CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Matches legacy MySQL→PG dumps (quoted camelCase); frontend expects groupName, salaryScale, userId.
CREATE TABLE IF NOT EXISTS job_groups (
  id SERIAL PRIMARY KEY,
  "groupName" VARCHAR(255) NOT NULL,
  "salaryScale" NUMERIC(12, 2),
  description TEXT,
  "userId" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  voided INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS staff (
  staff_id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  department_id INTEGER REFERENCES departments (department_id),
  job_group_id INTEGER REFERENCES job_groups (id),
  gender TEXT,
  date_of_birth DATE,
  employment_status TEXT,
  start_date DATE,
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  nationality TEXT,
  marital_status TEXT,
  employment_type TEXT,
  manager_id INTEGER REFERENCES staff (staff_id),
  role TEXT,
  place_of_birth TEXT,
  blood_type TEXT,
  religion TEXT,
  national_id TEXT,
  kra_pin TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  number_of_days INTEGER,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_applications (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  leave_type_id INTEGER NOT NULL REFERENCES leave_types (id),
  handover_staff_id INTEGER REFERENCES staff (staff_id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  number_of_days NUMERIC,
  reason TEXT,
  handover_comments TEXT,
  status TEXT,
  approved_start_date DATE,
  approved_end_date DATE,
  actual_return_date DATE,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_performance (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  review_date DATE,
  review_score NUMERIC,
  comments TEXT,
  reviewer_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_compensation (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  base_salary NUMERIC,
  allowances NUMERIC,
  bonuses NUMERIC,
  bank_name TEXT,
  account_number TEXT,
  pay_frequency TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_training (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  course_name TEXT,
  institution TEXT,
  certification_name TEXT,
  completion_date DATE,
  expiry_date DATE,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_disciplinary (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  action_type TEXT,
  action_date DATE,
  reason TEXT,
  comments TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_contracts (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  contract_type TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  status TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_retirements (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  retirement_date DATE,
  retirement_type TEXT,
  comments TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_loans (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  loan_amount NUMERIC,
  loan_date DATE,
  status TEXT,
  repayment_schedule TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monthly_payroll (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  pay_period DATE,
  gross_salary NUMERIC,
  net_salary NUMERIC,
  allowances NUMERIC,
  deductions NUMERIC,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_dependants (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  dependant_name TEXT,
  relationship TEXT,
  date_of_birth DATE,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_terminations (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  exit_date DATE,
  reason TEXT,
  exit_interview_details TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_bank_details (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  bank_name TEXT,
  account_number TEXT,
  branch_name TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_memberships (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  organization_name TEXT,
  membership_number TEXT,
  start_date DATE,
  end_date DATE,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_benefits (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  benefit_name TEXT,
  enrollment_date DATE,
  status TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assigned_assets (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  asset_name TEXT,
  serial_number TEXT,
  assignment_date DATE,
  return_date DATE,
  asset_condition TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_promotions (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  old_job_group_id INTEGER REFERENCES job_groups (id),
  new_job_group_id INTEGER REFERENCES job_groups (id),
  promotion_date DATE,
  comments TEXT,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_project_assignments (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  project_id INTEGER,
  milestone_name TEXT,
  role TEXT,
  status TEXT,
  due_date DATE,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_leave_entitlements (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff (staff_id),
  leave_type_id INTEGER NOT NULL REFERENCES leave_types (id),
  year INTEGER NOT NULL,
  allocated_days NUMERIC,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (staff_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS public_holidays (
  id SERIAL PRIMARY KEY,
  holiday_name TEXT NOT NULL,
  holiday_date DATE NOT NULL,
  user_id INTEGER,
  voided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_voided ON staff (voided);
CREATE INDEX IF NOT EXISTS idx_leave_applications_voided ON leave_applications (voided);
CREATE INDEX IF NOT EXISTS idx_attendance_staff_date ON attendance (staff_id, date);
CREATE INDEX IF NOT EXISTS idx_job_groups_voided ON job_groups (voided);

COMMIT;
