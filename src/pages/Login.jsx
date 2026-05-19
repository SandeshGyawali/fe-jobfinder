import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../utils/apiFetch';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.message.includes('verify your email')) {
        setUnverified(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setResendMessage('');
    try {
      await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResendMessage('Verification email sent! Check your inbox.');
    } catch {
      setResendMessage('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Welcome back to JobSearch</p>

        {resetSuccess && (
          <p className="auth-success">Password updated! You can now sign in.</p>
        )}

        {error && <p className="auth-error">{error}</p>}

        {unverified && (
          <div className="auth-unverified">
            <p>Your email is not verified. Check your inbox or</p>
            <button
              className="auth-resend-btn"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending…' : 'resend verification email'}
            </button>
            {resendMessage && <p className="auth-resend-msg">{resendMessage}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
