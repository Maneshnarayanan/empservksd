#!/usr/bin/env bash
# Database Restoration Script for employeeserviceksd.com
# Usage: ./scripts/restore-db.sh <backup_file.sql.gz>

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <path_to_backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# Source environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_NAME="${DB_NAME:-employeeserviceksd}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "[WARNING] This will restore the database '${DB_NAME}' from ${BACKUP_FILE}."
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
  echo "Restoration aborted."
  exit 0
fi

echo "[INFO] Restoring database '${DB_NAME}' from ${BACKUP_FILE}..."
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD:-}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"

echo "[SUCCESS] Database restoration completed successfully."
