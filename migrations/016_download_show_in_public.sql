-- Migration 016: Add show_in_downloads to download_resources
ALTER TABLE download_resources 
ADD COLUMN IF NOT EXISTS show_in_downloads BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_download_resources_show_public 
ON download_resources(is_active, show_in_downloads, created_at DESC);

