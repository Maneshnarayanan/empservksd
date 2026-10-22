-- Migration: 004_kerala_finance_service.sql
-- Replace Education category with Kerala Finance Service

UPDATE service_categories 
SET name = 'KERALA FINANCE SERVICE',
    slug = 'kerala-finance-service',
    description = 'Finance Department Government of Kerala, e-Treasury, BIMS, Budget & Accounts'
WHERE id = 6 OR slug = 'education';

DELETE FROM service_links WHERE category_id = 6;

INSERT INTO service_links (category_id, name, destination_url, description, display_order, is_active) VALUES
(6, 'FINANCE DEPARTMENT', 'https://finance.kerala.gov.in', 'Government of Kerala Finance Department Portal, Government Orders and Rules', 1, true),
(6, 'E-TREASURY', 'https://etreasury.kerala.gov.in', 'Kerala State e-Treasury Receipts and Payments System', 2, true),
(6, 'BIMS BILLING', 'https://bims.kerala.gov.in', 'Bill Information and Management System for DDO Bill Submission', 3, true),
(6, 'PRISM PENSION', 'https://prism.kerala.gov.in', 'Pensioner Information System, Finance Department', 4, true),
(6, 'GAINS ACCOUNTS', 'https://gains.kerala.gov.in', 'Government Accounts Information System', 5, true),
(6, 'KSFE ONLINE', 'https://ksfeonline.com', 'Kerala State Financial Enterprises Online Services', 6, true),
(6, 'TSB ONLINE', 'https://treasury.kerala.gov.in', 'Treasury Savings Bank Electronic Accounts Portal', 7, true),
(6, 'BUDGET PORTAL', 'https://budget.kerala.gov.in', 'Kerala State Annual Budget & Expenditure Allocation Statements', 8, true);
