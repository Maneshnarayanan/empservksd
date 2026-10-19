-- Initial Schema Migration for employeeserviceksd.com
-- Migration: 001_initial_schema.sql

-- 1. Administrators Table
CREATE TABLE IF NOT EXISTS administrators (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_administrators_username ON administrators(username);
CREATE INDEX IF NOT EXISTS idx_administrators_email ON administrators(email);

-- 2. Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_order ON service_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON service_categories(is_active);

-- 3. Service Links Table
CREATE TABLE IF NOT EXISTS service_links (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    destination_url TEXT NULL, -- NULL or empty means placeholder/unconfigured
    description TEXT,
    icon VARCHAR(100) NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_links_category ON service_links(category_id);
CREATE INDEX IF NOT EXISTS idx_service_links_order ON service_links(display_order);
CREATE INDEX IF NOT EXISTS idx_service_links_active ON service_links(is_active);

-- 4. Download Resources Table
CREATE TABLE IF NOT EXISTS download_resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NULL DEFAULT 'General',
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    download_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_download_resources_category ON download_resources(category);
CREATE INDEX IF NOT EXISTS idx_download_resources_active ON download_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_download_resources_created ON download_resources(created_at DESC);

-- 5. Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_order ON blog_categories(display_order);

-- 6. Blog Articles Table
CREATE TABLE IF NOT EXISTS blog_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    category_id INT NOT NULL REFERENCES blog_categories(id) ON DELETE RESTRICT,
    featured_image VARCHAR(255) NULL,
    author_name VARCHAR(150) NOT NULL DEFAULT 'Administrator',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ NULL,
    created_by INT NULL REFERENCES administrators(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON blog_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON blog_articles(status);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON blog_articles(published_at DESC);

-- 7. Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Express Session Table (Standard for connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);
