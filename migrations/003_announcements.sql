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
('SPARK Annual Property Return', 'Annual Property Return (APR) submission window is open on SPARK portal for Kerala State Employees.', 'https://www.spark.gov.in', 'urgent', 1, true),
('MEDISEP Hospital Network', 'Updated empanelled hospitals list and grievance redressal helpline details for Kasaragod district.', '/downloads', 'info', 2, true),
('General Provident Fund (GPF)', 'GPF Annual Accounts Statements for the current financial year are ready for download and verification.', '/services', 'warning', 3, true);

-- Add announcement ticker setting
INSERT INTO website_settings (key, value, description) VALUES
('ticker_enabled', 'true', 'Enable or disable the top announcement ticker banner')
ON CONFLICT (key) DO NOTHING;
