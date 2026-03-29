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
  const [form, setForm] = useState({
    email: 'admin@Shoplytics.com',
    password: 'Suraj@123'
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
    <AuthShell
      title="Sign in"
      subtitle="Use the fixed admin account to access the Shoplytics dashboard."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="credential-card">
          <p className="credential-title">Admin credentials</p>
          <p className="credential-text">
            Email: <strong>admin@Shoplytics.com</strong>
          </p>
          <p className="credential-text">
            Password: <strong>Suraj@123</strong>
          </p>
        </div>

        <label className="form-field">
          <span>Email</span>
          <input
            className="text-input"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            className="text-input"
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </label>

        <p className="form-hint">Only the fixed admin account can access this dashboard.</p>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
