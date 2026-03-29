import { startTransition, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { useToast } from '../toast/ToastProvider.jsx';

function getRedirectTarget(state) {
  return typeof state?.from === 'string' && state.from !== '/login'
    ? state.from
    : '/overview';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const toast = useToast();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const user = await auth.login(form);
      toast.success({
        title: `Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`,
        description: 'Your dashboard is ready.'
      });
      startTransition(() => {
        navigate(getRedirectTarget(location.state), {
          replace: true
        });
      });
    } catch (requestError) {
      toast.error({
        title: 'Could not sign in',
        description: requestError.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Sign in to access the Shoplytics analytics dashboard.">
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
        <label className="form-field">
          <span>Email</span>
          <input
            className="text-input"
            type="email"
            name="email"
            autoComplete="off"
            autoCapitalize="none"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <div className="password-input-wrap">
            <input
              className="text-input password-input"
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              autoComplete="off"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              onClick={() => setPasswordVisible((current) => !current)}
            >
              <span className="sr-only">{passwordVisible ? 'Hide password' : 'Show password'}</span>
              {passwordVisible ? (
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M2.5 10C3.9 6.8 6.7 5 10 5s6.1 1.8 7.5 5c-1.4 3.2-4.2 5-7.5 5S3.9 13.2 2.5 10Z" />
                  <circle cx="10" cy="10" r="2.4" />
                  <path d="M4 4L16 16" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M2.5 10C3.9 6.8 6.7 5 10 5s6.1 1.8 7.5 5c-1.4 3.2-4.2 5-7.5 5S3.9 13.2 2.5 10Z" />
                  <circle cx="10" cy="10" r="2.4" />
                </svg>
              )}
            </button>
          </div>
        </label>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
