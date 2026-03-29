import { describe, expect, it, vi } from 'vitest';
import { createAuthService } from '../src/services/authService.js';
import { loginSchema, registerSchema } from '../src/validation/auth.js';

describe('auth validation', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      name: 'Suraj Singh',
      email: 'suraj@example.com',
      password: 'Password1'
    });

    expect(result.success).toBe(true);
  });

  it('rejects weak passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Suraj Singh',
      email: 'suraj@example.com',
      password: 'password'
    });

    expect(result.success).toBe(false);
  });

  it('requires both fields for login', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: ''
    });

    expect(result.success).toBe(false);
  });
});

describe('createAuthService', () => {
  it('registers a user, normalizes email, and returns a session token', async () => {
    const repository = {
      findUserByEmail: vi.fn().mockResolvedValue(null),
      createUser: vi.fn().mockResolvedValue({
        id: 1,
        name: 'Suraj Singh',
        email: 'suraj@example.com',
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
      authSessionDays: 7
    });
    const result = await authService.register({
      name: 'Suraj Singh',
      email: ' SURAJ@EXAMPLE.COM ',
      password: 'Password1'
    });

    expect(repository.findUserByEmail).toHaveBeenCalledWith('suraj@example.com');
    expect(repository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'suraj@example.com',
        name: 'Suraj Singh'
      })
    );
    expect(result.user.email).toBe('suraj@example.com');
    expect(result.sessionToken).toBeTruthy();
  });

  it('rejects invalid login credentials', async () => {
    const repository = {
      findUserByEmail: vi.fn().mockResolvedValue(null)
    };

    const authService = createAuthService(repository, {
      authSessionDays: 7
    });

    await expect(
      authService.login({
        email: 'suraj@example.com',
        password: 'Password1'
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
        authSessionDays: 7
      }
    );

    await expect(authService.getAuthenticatedUser()).resolves.toBeNull();
  });
});
