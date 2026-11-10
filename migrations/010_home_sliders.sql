-- Migration: 010_home_sliders.sql
-- Create home_sliders table and seed initial featured spotlight slides

CREATE TABLE IF NOT EXISTS home_sliders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    link_url VARCHAR(500) NOT NULL,
    button_text VARCHAR(100) NOT NULL DEFAULT 'View Details',
    target_blank BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_home_sliders_active ON home_sliders(is_active);
CREATE INDEX IF NOT EXISTS idx_home_sliders_order ON home_sliders(display_order ASC, id DESC);

-- Seed initial home slider showcases
INSERT INTO home_sliders (
    title,
    description,
    image_filename,
    original_filename,
    link_url,
    button_text,
    target_blank,
    display_order,
    is_active
) VALUES
(
    'Dearness Allowance (DA) & Pay Revision Calculators 2026',
    'Official government orders on DA installment clearance, fixation calculators, and ready-to-use Excel utilities for Kerala state staff and teachers.',
    'slider_pay_revision_da_2026.svg',
    'slider_pay_revision_da_2026.svg',
    '/downloads',
    'Download Orders & Calculators',
    false,
    1,
    true
),
(
    'MEDISEP Phase II Empanelled Hospitals & Cashless Claim Guide',
    'Direct access to list of authorized private & government medical centres, digital Medi-Card download procedure, and reimbursement grievance desk.',
    'slider_medisep_insurance_2026.svg',
    'slider_medisep_insurance_2026.svg',
    '/services',
    'Explore Healthcare Directory',
    false,
    2,
    true
),
(
    'Government Orders, Circulars & Rule Amendments Gazette',
    'Latest departmental notifications, Kerala Service Rules (KSR) updates, and high-resolution official bulletins for district establishments.',
    'slider_psc_service_orders_2026.svg',
    'slider_psc_service_orders_2026.svg',
    '/news',
    'Read News & Circulars',
    false,
    3,
    true
);

