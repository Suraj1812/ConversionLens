import { Pool } from 'pg';

let pool = null;

function createPoolConfig(config) {
  return {
    connectionString: config.databaseUrl,
    max: config.databaseMaxPoolSize,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : false
  };
}

export async function connectDatabase(config) {
  pool = new Pool(createPoolConfig(config));
  await pool.query('SELECT 1');
  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }

  return pool;
}

export async function initializeDatabase() {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      event_id VARCHAR(128) UNIQUE,
      event_type VARCHAR(32) NOT NULL CHECK (event_type IN ('view', 'add_to_cart', 'purchase')),
      product_id VARCHAR(128) NOT NULL,
      product_title VARCHAR(200),
      session_id VARCHAR(128) NOT NULL,
      event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      page_url TEXT,
      source VARCHAR(32) NOT NULL DEFAULT 'shopify_theme'
        CHECK (source IN ('shopify_theme', 'shopify_pixel', 'dashboard', 'api')),
      currency CHAR(3),
      event_value NUMERIC(12, 2),
      quantity INTEGER CHECK (quantity IS NULL OR quantity > 0),
      order_id VARCHAR(128),
      meta JSONB,
      ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_events_event_type_timestamp
      ON events (event_type, event_timestamp DESC);

    CREATE INDEX IF NOT EXISTS idx_events_product_event_timestamp
      ON events (product_id, event_type, event_timestamp DESC);

    CREATE INDEX IF NOT EXISTS idx_events_session_timestamp
      ON events (session_id, event_timestamp ASC);
  `);
}

export async function getDatabaseReadiness() {
  if (!pool) {
    return {
      ready: false,
      state: 'disconnected'
    };
  }

  try {
    await pool.query('SELECT 1');

    return {
      ready: true,
      state: 'connected'
    };
  } catch (error) {
    return {
      ready: false,
      state: 'error',
      detail: error.message
    };
  }
}

export async function closeDatabase() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}
