-- Seed data for sectors table
-- Date: 2026-03-05
--
-- This script inserts the default government sectors into the sectors table.
-- It can be run multiple times safely (uses DO block to check existence).

DO $$
BEGIN
    -- Insert sectors only if they don't exist
    INSERT INTO sectors (name, description, voided) 
    SELECT 'Agriculture, Rural and Urban Development Sector', 'Sector covering agriculture, rural and urban development initiatives', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'Agriculture, Rural and Urban Development Sector' AND voided = false);

    INSERT INTO sectors (name, description, voided) 
    SELECT 'Education Sector', 'Sector responsible for education and training programs', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'Education Sector' AND voided = false);

    INSERT INTO sectors (name, description, voided) 
    SELECT 'Energy, Infrastructure and ICT Sector', 'Sector managing energy, infrastructure and information communication technology', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'Energy, Infrastructure and ICT Sector' AND voided = false);

    INSERT INTO sectors (name, description, voided) 
    SELECT 'Environment Protection Water and Natural Resources Sector', 'Sector focused on environment protection, water management and natural resources', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'Environment Protection Water and Natural Resources Sector' AND voided = false);

    INSERT INTO sectors (name, description, voided) 
    SELECT 'General Economic and Commercial Affairs (GECA) Sector', 'Sector handling general economic and commercial affairs', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'General Economic and Commercial Affairs (GECA) Sector' AND voided = false);

    INSERT INTO sectors (name, description, voided) 
    SELECT 'Governance Justice Law and Order (GJLO) Sector', 'Sector responsible for governance, justice, law and order', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'Governance Justice Law and Order (GJLO) Sector' AND voided = false);

    INSERT INTO sectors (name, description, voided) 
    SELECT 'Health Sector', 'Sector managing health services and programs', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'Health Sector' AND voided = false);

    INSERT INTO sectors (name, description, voided) 
    SELECT 'Public Administration and International Relations (PAIR) Sector', 'Sector handling public administration and international relations', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'Public Administration and International Relations (PAIR) Sector' AND voided = false);

    INSERT INTO sectors (name, description, voided) 
    SELECT 'Social Protection, Culture and Recreation Sector (SPCR) Sector', 'Sector managing social protection, culture and recreation programs', false
    WHERE NOT EXISTS (SELECT 1 FROM sectors WHERE name = 'Social Protection, Culture and Recreation Sector (SPCR) Sector' AND voided = false);

    RAISE NOTICE 'Sectors seed data inserted successfully';
END $$;

-- Verify the insert
SELECT COUNT(*) as total_sectors FROM sectors WHERE voided = false;
