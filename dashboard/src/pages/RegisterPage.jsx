import { startTransition, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { useToast } from '../toast/ToastProvider.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const user = await auth.register(form);
      toast.success({
        title: 'Account created',
        description: `Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Your workspace is ready.`
      });
      startTransition(() => {
        navigate('/overview', {
          replace: true
        });
      });
    } catch (requestError) {
      toast.error({
        title: 'Could not create account',
        description: requestError.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Set up secure access to your analytics dashboard."
      footer={
        <p className="form-note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Name</span>
          <input
            className="text-input"
            type="text"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>

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
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            required
          />
        </label>

        <p className="form-hint">Use at least 8 characters with uppercase, lowercase, and a number.</p>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
