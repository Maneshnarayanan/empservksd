-- Seed Initial Data Migration for employeeserviceksd.com
-- Migration: 002_seed_initial_data.sql

-- 1. Insert Service Categories from WEB DESIGN.xlsx (sequential auto-increment)
INSERT INTO service_categories (name, slug, description, display_order, is_active) VALUES
('SPARK', 'spark', 'Service and Payroll Administrative Repository for Kerala', 1, true),
('BIMS', 'bims', 'Bill Information and Management System', 2, true),
('AGEES', 'agees', 'Accountant General Employees Electronic Services', 3, true),
('TREASURY', 'treasury', 'Kerala State Treasury Services and e-Treasury', 4, true),
('TAX', 'tax', 'Income Tax, e-Filing, TRACES, and Tax Information Network', 5, true),
('KERALA FINANCE SERVICE', 'kerala-finance-service', 'Finance Department Government of Kerala, e-Treasury, BIMS, Budget & Accounts', 6, true),
('PF', 'pf', 'General Provident Fund and GAIN-PF Management', 7, true),
('KITE', 'kite', 'Kerala Infrastructure and Technology for Education Initiatives', 8, true),
('INSURANCE', 'insurance', 'State Life Insurance (SLI) and Group Insurance Scheme (GIS)', 9, true),
('PRISM', 'prism', 'Pensioners Information and Services Management', 10, true),
('MEDISEP', 'medisep', 'Medical Insurance for State Employees and Pensioners', 11, true);

-- 2. Insert Service Links from WEB DESIGN.xlsx
-- Note: destination_url is NULL or empty initially as destination URLs were unconfigured in source spreadsheet.
-- These will be managed/configured through the Administrator Portal.
INSERT INTO service_links (category_id, name, destination_url, description, display_order, is_active) VALUES
-- SPARK
(1, 'SPARK', NULL, 'Service and Payroll Administrative Repository for Kerala (SPARK Portal)', 1, true),
(1, 'INFOSPARK', NULL, 'Information and Employee Login for SPARK Services', 2, true),

-- BIMS
(2, 'BIMS', NULL, 'Bill Information and Management System Portal', 1, true),
(2, 'PFMS', NULL, 'Public Financial Management System Portal', 2, true),

-- AGEES
(3, 'KSEM', NULL, 'Kerala State Electronic Monitoring / AG Portal', 1, true),
(3, 'CAG', NULL, 'Comptroller and Auditor General of India Portal', 2, true),

-- TREASURY
(4, 'E TREASURY', NULL, 'Government of Kerala e-Treasury Online Payment Portal', 1, true),
(4, 'TSB', NULL, 'Treasury Savings Bank Online Portal', 2, true),

-- TAX
(5, 'EFILE', NULL, 'Income Tax Department e-Filing Portal', 1, true),
(5, 'TRACES', NULL, 'TDS Reconciliation Analysis and Correction Enabling System', 2, true),
(5, 'TIN NSDL', NULL, 'Tax Information Network (Protean / NSDL)', 3, true),
(5, 'BIN VIEW', NULL, 'Book Identification Number (BIN) Verification Portal', 4, true),
(5, 'OLTAS', NULL, 'Online Tax Accounting System Challan Status Portal', 5, true),

-- KERALA FINANCE SERVICE
(6, 'FINANCE DEPARTMENT', 'https://finance.kerala.gov.in', 'Government of Kerala Finance Department Portal, Government Orders and Rules', 1, true),
(6, 'E-TREASURY', 'https://etreasury.kerala.gov.in', 'Kerala State e-Treasury Receipts and Payments System', 2, true),
(6, 'BIMS BILLING', 'https://bims.kerala.gov.in', 'Bill Information and Management System for DDO Bill Submission', 3, true),
(6, 'PRISM PENSION', 'https://prism.kerala.gov.in', 'Pensioner Information System, Finance Department', 4, true),
(6, 'GAINS ACCOUNTS', 'https://gains.kerala.gov.in', 'Government Accounts Information System', 5, true),
(6, 'KSFE ONLINE', 'https://ksfeonline.com', 'Kerala State Financial Enterprises Online Services', 6, true),
(6, 'TSB ONLINE', 'https://treasury.kerala.gov.in', 'Treasury Savings Bank Electronic Accounts Portal', 7, true),
(6, 'BUDGET PORTAL', 'https://budget.kerala.gov.in', 'Kerala State Annual Budget & Expenditure Allocation Statements', 8, true),

-- PF
(7, 'GPF', NULL, 'General Provident Fund Kerala Portal', 1, true),
(7, 'GAIN PF', NULL, 'GAIN-PF Online Information and Services Portal', 2, true),

-- KITE
(8, 'SAMPOORNA', NULL, 'Sampoorna School Management Portal', 1, true),
(8, 'SAMAGRA', NULL, 'Samagra Resource & Learning Portal', 2, true),
(8, 'SAMETHAM', NULL, 'Sametham Kerala School Data Bank', 3, true),
(8, 'SAHITHAM', NULL, 'Sahitham Mentoring Portal', 4, true),
(8, 'KOOL', NULL, 'KOOL Open Online Learning Portal', 5, true),
(8, 'SAMANWAYA', NULL, 'Samanwaya Aided School Approval and Post Determination System', 6, true),

-- INSURANCE
(9, 'SLI', NULL, 'State Life Insurance Directorate Portal', 1, true),
(9, 'GIS', NULL, 'Group Insurance Scheme Portal', 2, true),

-- PRISM
(10, 'PRISM', NULL, 'Pensioners Information System (PRISM Kerala)', 1, true),

-- MEDISEP
(11, 'MEDISEP', NULL, 'Medical Insurance for State Employees and Pensioners Portal', 1, true);

-- 3. Insert Blog Categories from WEB DESIGN.xlsx (BLOGS & WEB column)
INSERT INTO blog_categories (name, slug, description, display_order) VALUES
('HM BLOG', 'hm-blog', 'Headmasters and School Administration Community Blog & Updates', 1),
('MUTTAM BLOG', 'muttam-blog', 'Educational resources, salary calculations, and employee guidance', 2),
('MATHS BLOG', 'maths-blog', 'Kerala Education and Teachers community discussions and resources', 3),
('ALRAHMAN', 'alrahman', 'Government employee welfare, rules, and service regulations notes', 4),
('RENJITHKUMAR', 'renjithkumar', 'Service rules, tax calculation notes, and administrative guidance', 5);

-- 4. Insert Website Settings verified from WEB DESIGN.xlsx
INSERT INTO website_settings (key, value, description) VALUES
('site_title', 'EMPLOYEES SERVICE, KASARAGOD', 'Organization and website display name'),
('site_tagline', 'Employee Services & Community Resource Portal for Kerala State Employees', 'Portal subtitle and tagline'),
('site_address', 'BANK ROAD, NEAR MALLIKARJUNA TEMPLE, KASARGOD', 'Physical office address'),
('contact_email', 'esksd31@gmail.com', 'Primary contact email address'),
('contact_mobile', '9447396181', 'Primary phone contact number'),
('contact_whatsapp', '9447396181', 'WhatsApp helpline number')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;
