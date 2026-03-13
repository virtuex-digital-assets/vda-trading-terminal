import React, { useState } from 'react';
import './Login.css';

/**
 * Login / Register – Authentication screen.
 *
 * In demo (standalone) mode the form accepts any credentials and immediately
 * calls onLogin('demo').
 *
 * When a REACT_APP_API_URL env var is set the form POSTs to the backend
 * /api/auth/login or /api/auth/register endpoint and stores the returned JWT
 * in localStorage.
 *
 * Props:
 *   onLogin(role)  – called after successful authentication ('super_admin'|'admin'|'trader')
 */
const API_URL = process.env.REACT_APP_API_URL || '';

const Login = ({ onLogin }) => {
  const [mode,     setMode]     = useState('login');  // 'login' | 'register'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [isDemo,   setIsDemo]   = useState(!API_URL);

  const isRegister = mode === 'register';

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

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
        // Registration in demo mode falls straight through to trader role
        const e = email.toLowerCase();
        if (e.includes('superadmin') || e.includes('super_admin') || e.includes('root')) {
          onLogin('super_admin');
        } else if (e.includes('admin')) {
          onLogin('admin');
        } else {
          onLogin('trader');
        }
      }, 400);
      return;
    }

    // ── Live API mode ─────────────────────────────────────────────────────
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body     = isRegister
        ? { name, email, password }
        : { email, password };

      const res  = await fetch(`${API_URL}${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isRegister ? 'Registration failed' : 'Login failed'));
        setLoading(false);
        return;
      }
      localStorage.setItem('vda_token', data.token);
      localStorage.setItem('vda_user',  JSON.stringify(data.user));
      onLogin(data.user.role);
    } catch {
      setError('Cannot reach server. Switching to demo mode.');
      setIsDemo(true);
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'super_admin') { setEmail('superadmin@vda.trade'); setPassword('SuperAdmin1!'); }
    else if (role === 'admin')  { setEmail('admin@vda.trade');      setPassword('Admin1234!'); }
    else                        { setEmail('demo@vda.trade');        setPassword('Demo1234!'); }
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

        {/* ── Login / Register tab toggle ───────────────────────── */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab${!isRegister ? ' active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`login-tab${isRegister ? ' active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>

        {/* ── Form ─────────────────────────────────────────────────── */}
        <form className="login-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="login-field">
              <label htmlFor="login-name">Full name</label>
              <input
                id="login-name"
                type="text"
                autoComplete="name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

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
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder={isDemo ? 'any password' : isRegister ? 'min 8 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isRegister ? 8 : undefined}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className={`login-btn${loading ? ' loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Connecting…' : isRegister ? 'Create account' : 'Login'}
          </button>
        </form>

        {/* ── Demo shortcuts (login mode only) ───────────────────── */}
        {!isRegister && (
          <div className="login-demo-row">
            <span className="login-demo-label">Quick login:</span>
            <button className="login-demo-btn" onClick={() => fillDemo('trader')}>Demo Trader</button>
            <button className="login-demo-btn admin" onClick={() => fillDemo('admin')}>Demo Admin</button>
            <button className="login-demo-btn superadmin" onClick={() => fillDemo('super_admin')}>Super Admin</button>
          </div>
        )}

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
