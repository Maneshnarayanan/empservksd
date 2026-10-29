-- Migration: 009_home_news_posters.sql
-- Add is_home_published column to news_posters and set initial home showcase

ALTER TABLE news_posters ADD COLUMN IF NOT EXISTS is_home_published BOOLEAN NOT NULL DEFAULT false;

-- Initial seed: Mark top 3 active posters to be published on the home page with display orders 1, 2, 3
UPDATE news_posters SET is_home_published = true, display_order = 1 WHERE id = 1;
UPDATE news_posters SET is_home_published = true, display_order = 2 WHERE id = 2;
UPDATE news_posters SET is_home_published = true, display_order = 3 WHERE id = 3;

-- Index for fast home page poster querying
CREATE INDEX IF NOT EXISTS idx_news_posters_home ON news_posters(is_home_published, display_order ASC, published_date DESC);
