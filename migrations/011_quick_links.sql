-- Migration 011: Quick Links (Popular Articles / Trending Guidelines)
CREATE TABLE IF NOT EXISTS quick_links (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    badge_text VARCHAR(50) DEFAULT NULL,
    target_blank BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quick_links_active_order ON quick_links(is_active, display_order ASC, id ASC);

-- Seed initial trending employee quick links matching the reference site
INSERT INTO quick_links (title, url, badge_text, target_blank, display_order, is_active)
SELECT title, url, badge_text, target_blank, display_order, is_active FROM (
    VALUES
        ('DA Chart & Pay Fixation', '/downloads', 'HOT', false, 1, true),
        ('Daily Wages Rates 2026', '/downloads', NULL, false, 2, true),
        ('Strike Period Regularisation', '/news', NULL, false, 3, true),
        ('KSR Amendment & Casual Leave', '/blogs', NULL, false, 4, true),
        ('ELS (Leave Surrender) Chart', '/downloads', NULL, false, 5, true),
        ('Quarters Allotment Rules', '/services', NULL, false, 6, true),
        ('GPF Rules & Interest Rates', '/services', NULL, false, 7, true),
        ('MEDISEP Empanelled Hospitals', '/services', NULL, false, 8, true)
) AS v(title, url, badge_text, target_blank, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM quick_links);

