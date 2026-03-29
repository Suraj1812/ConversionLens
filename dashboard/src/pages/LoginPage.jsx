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
          <input
            className="text-input"
            type="password"
            name="password"
            autoComplete="off"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </label>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
