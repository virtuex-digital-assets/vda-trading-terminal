import React, { useState } from 'react';
import './Login.css';

/**
 * Login – Authentication screen.
 *
 * In demo (standalone) mode the form accepts any credentials and immediately
 * calls onLogin('demo').
 *
 * When a REACT_APP_API_URL env var is set the form POSTs to the backend
 * /api/auth/login endpoint and stores the returned JWT in localStorage.
 *
 * Props:
 *   onLogin(role)  – called after successful authentication ('super_admin'|'admin'|'trader')
 */
const API_URL = process.env.REACT_APP_API_URL || '';

const Login = ({ onLogin }) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [isDemo,   setIsDemo]   = useState(!API_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ── Demo (no backend) mode ────────────────────────────────────────────
    // NOTE: Role detection from email is intentionally simple for demo/offline
    // mode only. Production must validate roles server-side via JWT claims and
    // NEVER trust client-supplied role data.
    if (isDemo) {
      setTimeout(() => {
        setLoading(false);
        // Role detection from email prefix
        const e = email.toLowerCase();
        if (e.includes('superadmin') || e.includes('super_admin') || e.includes('root')) {
          onLogin('super_admin', null);
        } else if (e.includes('admin')) {
          onLogin('admin', null);
        } else {
          onLogin('trader', null);
        }
      }, 400);
      return;
    }

    // ── Live API mode ─────────────────────────────────────────────────────
    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      localStorage.setItem('vda_token', data.token);
      localStorage.setItem('vda_user',  JSON.stringify(data.user));
      onLogin(data.user.role, data.token);
    } catch {
      setError('Cannot reach server. Switching to demo mode.');
      setIsDemo(true);
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'super_admin') { setEmail('super@vda.trade');  setPassword('Super1234!'); }
    else if (role === 'admin')  { setEmail('admin@vda.trade');  setPassword('Admin1234!'); }
    else                        { setEmail('demo@vda.trade');   setPassword('Demo1234!'); }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="login-logo">
          <span className="login-logo-vda">VDA</span>
          <span className="login-logo-sub">Trading Terminal</span>
        </div>

        {/* ── Demo / Live badge ─────────────────────────────────── */}
        <div className={`login-mode-badge ${isDemo ? 'demo' : 'live'}`}>
          {isDemo ? '● DEMO MODE' : '● LIVE BACKEND'}
        </div>

        {/* ── Form ─────────────────────────────────────────────────── */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder={isDemo ? 'any email to enter demo' : 'trader@broker.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder={isDemo ? 'any password' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className={`login-btn${loading ? ' loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Connecting…' : 'Login'}
          </button>
        </form>

        {/* ── Demo shortcuts ─────────────────────────────────────── */}
        <div className="login-demo-row">
          <span className="login-demo-label">Quick login:</span>
          <button className="login-demo-btn" onClick={() => fillDemo('trader')}>Demo Trader</button>
          <button className="login-demo-btn admin" onClick={() => fillDemo('admin')}>Demo Admin</button>
          <button className="login-demo-btn superadmin" onClick={() => fillDemo('super_admin')}>Super Admin</button>
        </div>

        <p className="login-hint">
          {isDemo
            ? 'Running in offline demo mode – no server required.'
            : `Connecting to ${API_URL}`}
        </p>
      </div>
    </div>
  );
};

export default Login;
