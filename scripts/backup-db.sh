#!/usr/bin/env bash
# Database Backup Script for employeeserviceksd.com
# Usage: ./scripts/backup-db.sh [backup_destination_dir]

set -euo pipefail

BACKUP_DIR="${1:-/var/backups/employeeserviceksd}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/empservksd_${TIMESTAMP}.sql.gz"

# Source environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_NAME="${DB_NAME:-employeeserviceksd}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "[INFO] Starting database backup for '${DB_NAME}' at $(date)"
mkdir -p "${BACKUP_DIR}"

# Execute pg_dump and pipe through gzip
PGPASSWORD="${DB_PASSWORD:-}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"

echo "[SUCCESS] Backup written to ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Retention policy: Remove backups older than 30 days
find "${BACKUP_DIR}" -name "empservksd_*.sql.gz" -type f -mtime +30 -delete
echo "[INFO] Backup retention cleanup completed."
