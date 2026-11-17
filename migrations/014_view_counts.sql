-- Migration: 014_view_counts.sql
-- Add view_count columns to custom_pages, blog_articles, and news_posters

ALTER TABLE custom_pages ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;
ALTER TABLE blog_articles ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;
ALTER TABLE news_posters ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0;

UPDATE custom_pages SET view_count = 0 WHERE view_count IS NULL;
UPDATE blog_articles SET view_count = 0 WHERE view_count IS NULL;
UPDATE news_posters SET view_count = 0 WHERE view_count IS NULL;
