import { describe, expect, it, vi } from 'vitest';
import { createAuthService } from '../src/services/authService.js';
import { loginSchema } from '../src/validation/auth.js';

describe('auth validation', () => {
  it('requires both fields for login', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: ''
    });

    expect(result.success).toBe(false);
  });
});

describe('createAuthService', () => {
  it('logs in with the fixed admin credentials and returns a session token', async () => {
    const repository = {
      findUserByEmail: vi.fn().mockResolvedValue(null),
      createUser: vi.fn().mockResolvedValue({
        id: 1,
        name: 'Shoplytics Admin',
        email: 'admin@shoplytics.com',
        createdAt: '2026-03-29T00:00:00.000Z'
      }),
      createSession: vi.fn().mockResolvedValue({
        id: 1,
        userId: 1,
        expiresAt: '2026-04-05T00:00:00.000Z'
      }),
      deleteExpiredSessions: vi.fn()
    };

    const authService = createAuthService(repository, {
      adminEmail: 'admin@Shoplytics.com',
      adminPassword: 'Suraj@123',
      adminName: 'Shoplytics Admin',
      authSessionDays: 7
    });
    const result = await authService.login({
      email: ' ADMIN@SHOPLYTICS.COM ',
      password: 'Suraj@123'
    });

    expect(repository.findUserByEmail).toHaveBeenCalledWith('admin@shoplytics.com');
    expect(repository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@shoplytics.com',
        name: 'Shoplytics Admin'
      })
    );
    expect(result.user.email).toBe('admin@shoplytics.com');
    expect(result.user.role).toBe('admin');
    expect(result.sessionToken).toBeTruthy();
  });

  it('rejects invalid login credentials', async () => {
    const authService = createAuthService({}, {
      adminEmail: 'admin@Shoplytics.com',
      adminPassword: 'Suraj@123',
      authSessionDays: 7
    });

    await expect(
      authService.login({
        email: 'admin@Shoplytics.com',
        password: 'WrongPassword1'
      })
    ).rejects.toMatchObject({
      statusCode: 401
    });
  });

  it('returns null when no session token is provided', async () => {
    const authService = createAuthService(
      {
        findSessionByTokenHash: vi.fn()
      },
      {
        adminEmail: 'admin@Shoplytics.com',
        adminPassword: 'Suraj@123',
        authSessionDays: 7
      }
    );

    await expect(authService.getAuthenticatedUser()).resolves.toBeNull();
  });

  it('rejects a session that does not belong to the fixed admin account', async () => {
    const authService = createAuthService(
      {
        findSessionByTokenHash: vi.fn().mockResolvedValue({
          sessionId: 1,
          userId: 2,
          email: 'someone@example.com'
        })
      },
      {
        adminEmail: 'admin@Shoplytics.com',
        adminPassword: 'Suraj@123',
        authSessionDays: 7
      }
    );

    await expect(authService.getAuthenticatedUser('token')).resolves.toBeNull();
  });
});
