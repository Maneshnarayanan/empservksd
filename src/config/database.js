const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

let pool = null;
let isInMemory = false;
let memDb = null;

function initDatabase() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  const usePgMem = process.env.NODE_ENV === 'test' || process.env.USE_PG_MEM === 'true';

  if (!usePgMem && (connectionString || process.env.DB_HOST)) {
    const config = connectionString
      ? { connectionString }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'employeeserviceksd',
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        };

    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });

    return pool;
  }

  // Fallback to in-memory PG emulator (pg-mem) for tests or standalone environments
  return initInMemoryDatabase();
}

async function testOrFallback() {
  if (process.env.USE_PG_MEM === 'true' || process.env.NODE_ENV === 'test') {
    return initInMemoryDatabase();
  }
  try {
    const p = initDatabase();
    await p.query('SELECT 1');
    return p;
  } catch (err) {
    console.warn(`[WARN] Could not connect to PostgreSQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432} (${err.code || err.message}).`);
    console.warn('[WARN] Falling back to in-memory PostgreSQL emulator (pg-mem) for local preview.');
    pool = null;
    return initInMemoryDatabase();
  }
}

function initInMemoryDatabase() {
  try {
    const { newDb, DataType } = require('pg-mem');
    memDb = newDb();
    
    // Register custom functions if needed (e.g. current_timestamp)
    memDb.public.registerFunction({
      name: 'version',
      implementation: () => 'PostgreSQL 15.0 (pg-mem simulated)'
    });

    memDb.public.registerFunction({
      name: 'to_regclass',
      args: [DataType.text],
      implementation: (name) => {
        if (!name) return null;
        const cleanName = name.replace(/^"|"$/g, '').toLowerCase();
        try {
          const table = memDb.public.getTable(cleanName, null);
          return table ? name : null;
        } catch {
          return null;
        }
      }
    });

    memDb.public.registerFunction({
      name: 'to_timestamp',
      args: [DataType.text],
      implementation: (epochSec) => new Date(parseFloat(epochSec) * 1000)
    });

    memDb.public.registerFunction({
      name: 'to_timestamp',
      args: [DataType.float],
      implementation: (epochSec) => new Date(epochSec * 1000)
    });

    const pgMock = memDb.adapters.createPg();
    pool = new pgMock.Pool();
    isInMemory = true;
    console.log('Database initialized in in-memory mode (pg-mem).');
    return pool;
  } catch (err) {
    console.error('Failed to initialize in-memory database:', err);
    throw err;
  }
}

async function query(text, params) {
  const p = initDatabase();
  return p.query(text, params);
}

async function getClient() {
  const p = initDatabase();
  return p.connect();
}

function isDbInMemory() {
  return isInMemory || process.env.USE_PG_MEM === 'true' || process.env.NODE_ENV === 'test';
}

function getPool() {
  return initDatabase();
}

module.exports = {
  query,
  getClient,
  getPool,
  initDatabase,
  initInMemoryDatabase,
  testOrFallback,
  isDbInMemory,
};
