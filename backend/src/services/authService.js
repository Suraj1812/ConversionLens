import { createSessionToken, hashSessionToken, safeEqualStrings } from '../lib/auth.js';
import { createHttpError } from '../lib/http.js';
import { authRepository } from '../repositories/authRepository.js';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'admin',
    emailVerified: true,
    createdAt: user.createdAt || user.userCreatedAt
  };
}

export function createAuthService(
  repository = authRepository,
  options = {
    adminEmail: 'admin@shoplytics.com',
    adminName: 'Shoplytics Admin',
    adminPassword: 'Suraj@123',
    authSessionDays: 1
  }
) {
  const adminEmail = normalizeEmail(options.adminEmail);

  return {
    async ensureAdminUser() {
      const existingUser = await repository.findUserByEmail(adminEmail);

      if (existingUser) {
        return repository.touchUserLogin(existingUser.id, {
          emailVerified: true
        });
      }

      try {
        const createdUser = await repository.createUser({
          name: options.adminName,
          email: adminEmail,
          passwordHash: null,
          emailVerified: true,
          lastLoginAt: new Date().toISOString()
        });

        return createdUser;
      } catch (error) {
        if (error.code === '23505') {
          const user = await repository.findUserByEmail(adminEmail);

          if (user) {
            return repository.touchUserLogin(user.id, {
              emailVerified: true
            });
          }
        }

        throw error;
      }
    },

    async login(credentials, context = {}) {
      const submittedEmail = normalizeEmail(credentials.email);
      const passwordMatches = safeEqualStrings(credentials.password, options.adminPassword);

      if (submittedEmail !== adminEmail || !passwordMatches) {
        throw createHttpError(401, 'Invalid email or password');
      }

      const adminUser = await this.ensureAdminUser();
      const session = await this.createSession(adminUser.id, context);

      return {
        user: sanitizeUser(adminUser),
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

      if (!session || normalizeEmail(session.email) !== adminEmail) {
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
