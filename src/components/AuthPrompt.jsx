import { Link } from 'react-router-dom';

export default function AuthPrompt({ message = 'Sign in to access this page.' }) {
  return (
    <div className="auth-prompt">
      <div className="auth-prompt-card">
        <h2 className="auth-prompt-title">Login Required</h2>
        <p className="auth-prompt-message">{message}</p>
        <div className="auth-prompt-actions">
          <Link to="/login" className="auth-btn">Sign in</Link>
          <Link to="/register" className="auth-prompt-register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
