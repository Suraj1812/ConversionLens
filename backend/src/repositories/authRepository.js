import { getPool } from '../db/pool.js';

export function createAuthRepository(poolProvider = getPool) {
  return {
    async createUser(user) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          INSERT INTO users (name, email, password_hash)
          VALUES ($1, $2, $3)
          RETURNING
            id,
            name,
            email,
            created_at AS "createdAt"
        `,
        [user.name, user.email, user.passwordHash]
      );

      return rows[0];
    },

    async findUserByEmail(email) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          SELECT
            id,
            name,
            email,
            password_hash AS "passwordHash",
            created_at AS "createdAt"
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
        [email]
      );

      return rows[0] ?? null;
    },

    async findUserById(id) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          SELECT
            id,
            name,
            email,
            created_at AS "createdAt"
          FROM users
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      return rows[0] ?? null;
    },

    async createSession(session) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          INSERT INTO user_sessions (
            user_id,
            session_token_hash,
            expires_at,
            ip_address,
            user_agent
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING
            id,
            user_id AS "userId",
            expires_at AS "expiresAt",
            created_at AS "createdAt"
        `,
        [session.userId, session.sessionTokenHash, session.expiresAt, session.ipAddress, session.userAgent]
      );

      return rows[0];
    },

    async findSessionByTokenHash(sessionTokenHash) {
      const pool = poolProvider();
      const { rows } = await pool.query(
        `
          SELECT
            s.id AS "sessionId",
            s.user_id AS "userId",
            s.expires_at AS "expiresAt",
            s.created_at AS "createdAt",
            u.id,
            u.name,
            u.email,
            u.created_at AS "userCreatedAt"
          FROM user_sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.session_token_hash = $1
            AND s.revoked_at IS NULL
            AND s.expires_at > NOW()
          LIMIT 1
        `,
        [sessionTokenHash]
      );

      return rows[0] ?? null;
    },

    async revokeSessionByTokenHash(sessionTokenHash) {
      const pool = poolProvider();
      const { rowCount } = await pool.query(
        `
          UPDATE user_sessions
          SET revoked_at = NOW()
          WHERE session_token_hash = $1
            AND revoked_at IS NULL
        `,
        [sessionTokenHash]
      );

      return rowCount > 0;
    },

    async deleteExpiredSessions() {
      const pool = poolProvider();
      await pool.query(
        `
          DELETE FROM user_sessions
          WHERE expires_at <= NOW()
             OR revoked_at IS NOT NULL
        `
      );
    }
  };
}

export const authRepository = createAuthRepository();
