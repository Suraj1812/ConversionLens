import { getPool } from '../db/pool.js';

export function createEventRepository(poolProvider = getPool) {
  return {
    async insertEvent(event) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          INSERT INTO events (
            event_id,
            event_type,
            product_id,
            product_title,
            session_id,
            event_timestamp,
            page_url,
            source,
            currency,
            event_value,
            quantity,
            order_id,
            meta
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING
            id,
            event_id AS "eventId",
            event_type AS "eventType",
            product_id AS "productId",
            product_title AS "productTitle",
            session_id AS "sessionId",
            event_timestamp AS "timestamp",
            page_url AS "pageUrl",
            source,
            currency,
            event_value::float AS "value",
            quantity,
            order_id AS "orderId",
            meta,
            ingested_at AS "ingestedAt"
        `,
        [
          event.eventId ?? null,
          event.eventType,
          event.productId,
          event.productTitle ?? null,
          event.sessionId,
          event.timestamp,
          event.pageUrl ?? null,
          event.source,
          event.currency ?? null,
          event.value ?? null,
          event.quantity ?? null,
          event.orderId ?? null,
          event.meta ?? null
        ]
      );

      return rows[0];
    },

    async findByEventId(eventId) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          SELECT
            id,
            event_id AS "eventId",
            event_type AS "eventType",
            product_id AS "productId",
            product_title AS "productTitle",
            session_id AS "sessionId",
            event_timestamp AS "timestamp",
            page_url AS "pageUrl",
            source,
            currency,
            event_value::float AS "value",
            quantity,
            order_id AS "orderId",
            meta,
            ingested_at AS "ingestedAt"
          FROM events
          WHERE event_id = $1
          LIMIT 1
        `,
        [eventId]
      );

      return rows[0] ?? null;
    },

    async getOverviewRollup({ rangeStart, rangeEnd }) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          SELECT
            COUNT(*)::int AS "totalEvents",
            COUNT(DISTINCT session_id)::int AS "totalUsers",
            COUNT(*) FILTER (WHERE event_type = 'view')::int AS "viewCount",
            COUNT(*) FILTER (WHERE event_type = 'add_to_cart')::int AS "cartCount",
            COUNT(*) FILTER (WHERE event_type = 'purchase')::int AS "purchaseCount",
            COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'view')::int AS "viewSessions",
            COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'purchase')::int AS "purchaseSessions"
          FROM events
          WHERE event_timestamp BETWEEN $1 AND $2
        `,
        [rangeStart, rangeEnd]
      );

      return rows[0];
    },

    async getFunnelEvents({ rangeStart, rangeEnd }) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          SELECT
            session_id AS "sessionId",
            event_type AS "eventType",
            event_timestamp AS "timestamp"
          FROM events
          WHERE event_timestamp BETWEEN $1 AND $2
            AND event_type = ANY($3::text[])
          ORDER BY session_id ASC, event_timestamp ASC
        `,
        [rangeStart, rangeEnd, ['view', 'add_to_cart', 'purchase']]
      );

      return rows;
    },

    async getProductRollups({ rangeStart, rangeEnd }) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          SELECT
            product_id AS "productId",
            event_type AS "eventType",
            COALESCE(MAX(product_title), product_id) AS "productTitle",
            COUNT(*)::int AS "totalCount",
            COUNT(DISTINCT session_id)::int AS "uniqueSessions"
          FROM events
          WHERE event_timestamp BETWEEN $1 AND $2
            AND event_type = ANY($3::text[])
          GROUP BY product_id, event_type
        `,
        [rangeStart, rangeEnd, ['view', 'add_to_cart', 'purchase']]
      );

      return rows;
    }
  };
}

export const eventRepository = createEventRepository();
