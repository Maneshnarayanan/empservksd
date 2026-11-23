-- Migration: 017_job_vacancy_blocks.sql
-- Add blocks JSONB column to job_vacancies table for dynamic modular page building

ALTER TABLE job_vacancies ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;

