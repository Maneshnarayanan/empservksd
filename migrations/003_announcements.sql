-- Migration: 003_announcements.sql
-- Create announcements table and seed initial announcements

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'urgent', -- 'urgent', 'info', 'warning', 'success'
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_order ON announcements(display_order);

-- Seed initial announcements
INSERT INTO announcements (title, message, link_url, type, display_order, is_active) VALUES
('Attention DDOs: Annual Property Return (APR) Submission', 'Ensure all gazetted and non-gazetted submissions are completed before quarterly cutoff. Access direct login portal.', 'https://www.spark.gov.in/webspark/(S(4w1zscqlzcwfuk3ipqncyhnb))/sparklogin.aspx', 'urgent', 1, true),
('MEDISEP Phase II: Hospital Network & Cashless Claims', 'Updated directory of cashless empanelled private and government hospitals in Kasaragod and Mangalore regions.', '/downloads', 'info', 2, true),
('GPF Annual Credit Cards & Interest Calculations', 'Annual accounts statements are available for employee verification via the AG portal with instant ledger reconciliation.', '/services', 'warning', 3, true),
('Monthly Establishment Bill Processing & DSC Verification', 'All DDOs must ensure digital signature certificate (DSC) validity and timely token submission before the cutoff.', 'https://bims.kerala.gov.in', 'urgent', 4, true);

-- Add announcement ticker setting
INSERT INTO website_settings (key, value, description) VALUES
('ticker_enabled', 'true', 'Enable or disable the top announcement ticker banner')
ON CONFLICT (key) DO NOTHING;
