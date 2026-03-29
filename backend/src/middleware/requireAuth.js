import { clearSessionCookie, getBearerTokenFromRequest, getSessionTokenFromRequest } from '../lib/auth.js';
import { createHttpError } from '../lib/http.js';

export function createRequireAuth(authService, config) {
  return async function requireAuth(req, res, next) {
    try {
      const sessionToken =
        getBearerTokenFromRequest(req) || getSessionTokenFromRequest(req, config.authCookieName);
      const session = await authService.getAuthenticatedUser(sessionToken);

      if (!session) {
        clearSessionCookie(res, config);
        throw createHttpError(401, 'Authentication required');
      }

      req.user = session.user;
      req.authSession = session.session;
      next();
    } catch (error) {
      next(error);
    }
  };
}
