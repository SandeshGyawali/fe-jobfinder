import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../utils/apiFetch';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.detail || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {status === 'loading' && (
          <>
            <h1 className="auth-title">Verifying…</h1>
            <p className="auth-subtitle">Please wait while we verify your email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="auth-title">Email verified!</h1>
            <p className="auth-subtitle">{message}</p>
            <Link to="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '24px' }}>
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="auth-title">Verification failed</h1>
            <p className="auth-error">{message}</p>
            <p className="auth-footer">
              <Link to="/login">Request a new link</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
