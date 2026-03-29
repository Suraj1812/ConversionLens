import { createContext, useContext, useEffect, useState } from 'react';
import { getJson, postJson } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function bootstrap() {
      try {
        const payload = await getJson('/auth/me', undefined, {
          suppressUnauthorizedEvent: true
        });

        if (isActive) {
          setUser(payload.user);
        }
      } catch (error) {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }

    window.addEventListener('shoplytics:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('shoplytics:unauthorized', handleUnauthorized);
    };
  }, []);

  async function login(credentials) {
    const payload = await postJson('/auth/login', credentials, {
      suppressUnauthorizedEvent: true
    });
    setUser(payload.user);
    return payload.user;
  }

  async function register(credentials) {
    const payload = await postJson('/auth/register', credentials, {
      suppressUnauthorizedEvent: true
    });
    setUser(payload.user);
    return payload.user;
  }

  async function logout() {
    await postJson('/auth/logout', undefined, {
      suppressUnauthorizedEvent: true
    }).catch(() => null);
    setUser(null);
  }

  async function refresh() {
    const payload = await getJson('/auth/me', undefined, {
      suppressUnauthorizedEvent: true
    });
    setUser(payload.user);
    return payload.user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
