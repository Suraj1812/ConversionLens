import { createHttpError } from '../lib/http.js';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword
} from '../lib/auth.js';
import { authRepository } from '../repositories/authRepository.js';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt || user.userCreatedAt
  };
}

export function createAuthService(
  repository = authRepository,
  options = {
    authSessionDays: 7
  }
) {
  return {
    async register(credentials, context = {}) {
      const email = normalizeEmail(credentials.email);
      const existingUser = await repository.findUserByEmail(email);

      if (existingUser) {
        throw createHttpError(409, 'An account already exists with this email');
      }

      const passwordHash = await hashPassword(credentials.password);

      try {
        const user = await repository.createUser({
          name: credentials.name.trim(),
          email,
          passwordHash
        });

        const session = await this.createSession(user.id, context);
        return {
          user: sanitizeUser(user),
          sessionToken: session.sessionToken,
          sessionExpiresAt: session.expiresAt
        };
      } catch (error) {
        if (error.code === '23505') {
          throw createHttpError(409, 'An account already exists with this email');
        }

        throw error;
      }
    },

    async login(credentials, context = {}) {
      const email = normalizeEmail(credentials.email);
      const user = await repository.findUserByEmail(email);

      if (!user) {
        throw createHttpError(401, 'Invalid email or password');
      }

      const passwordMatches = await verifyPassword(credentials.password, user.passwordHash);

      if (!passwordMatches) {
        throw createHttpError(401, 'Invalid email or password');
      }

      const session = await this.createSession(user.id, context);
      return {
        user: sanitizeUser(user),
        sessionToken: session.sessionToken,
        sessionExpiresAt: session.expiresAt
      };
    },

    async createSession(userId, context = {}) {
      await repository.deleteExpiredSessions();

      const sessionToken = createSessionToken();
      const sessionTokenHash = hashSessionToken(sessionToken);
      const expiresAt = new Date(Date.now() + options.authSessionDays * 24 * 60 * 60 * 1000);

      await repository.createSession({
        userId,
        sessionTokenHash,
        expiresAt,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null
      });

      return {
        sessionToken,
        expiresAt: expiresAt.toISOString()
      };
    },

    async getAuthenticatedUser(sessionToken) {
      if (!sessionToken) {
        return null;
      }

      const sessionTokenHash = hashSessionToken(sessionToken);
      const session = await repository.findSessionByTokenHash(sessionTokenHash);

      if (!session) {
        return null;
      }

      return {
        user: sanitizeUser(session),
        session: {
          id: session.sessionId,
          userId: session.userId,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt
        }
      };
    },

    async logout(sessionToken) {
      if (!sessionToken) {
        return false;
      }

      return repository.revokeSessionByTokenHash(hashSessionToken(sessionToken));
    }
  };
}

export const authService = createAuthService();
