-- Migration: 007_news_posters.sql
-- Create news_posters table and seed initial announcements

CREATE TABLE IF NOT EXISTS news_posters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    image_filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_posters_active ON news_posters(is_active);
CREATE INDEX IF NOT EXISTS idx_news_posters_date ON news_posters(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_posters_order ON news_posters(display_order ASC);

-- Seed initial official news posters
INSERT INTO news_posters (
    title, caption, image_filename, original_filename, display_order, is_active, published_date
) VALUES
(
    'Dearness Allowance (DA) Rate Hike & Arrears Settlement Schedule Announced for Kerala Staff',
    'Official circular briefing on the sanctioned DA hike, establishment bill processing on SPARK/BIMS, and special helpdesk guidance for Kasaragod district employees and school teachers.',
    'news_poster_da_arrears_2026.svg',
    'DA_Arrears_News_Poster_2026.svg',
    1,
    true,
    '2026-10-26'
),
(
    'MEDISEP Phase II Empanelled Hospital Network & Cashless Claim Pre-Authorization Guidelines',
    'Comprehensive update on cashless claims across 18 empanelled hospitals in Kasaragod & Mangalore with QR Medi-Card issuance guidelines.',
    'news_poster_medisep_camp_2026.svg',
    'MEDISEP_Phase2_News_Poster.svg',
    2,
    true,
    '2026-10-25'
),
(
    'Annual Property Return (APR) 2026 Submission: Mandatory Electronic Filing on SPARK Portal',
    'Strict compliance advisory for Drawing and Disbursing Officers (DDOs) and establishment staff to submit and countersign APR declarations on SPARK.',
    'news_poster_spark_apr_2026.svg',
    'SPARK_APR_News_Poster_2026.svg',
    3,
    true,
    '2026-10-24'
);

