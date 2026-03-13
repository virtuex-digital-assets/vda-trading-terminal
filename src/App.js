import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import mt4Bridge from './services/mt4Bridge';
import backendBridge from './services/backendBridge';

import MarketWatch    from './components/MarketWatch/MarketWatch';
import Chart          from './components/Chart/Chart';
import OrderPanel     from './components/OrderPanel/OrderPanel';
import Positions      from './components/Positions/Positions';
import AccountInfo    from './components/AccountInfo/AccountInfo';
import Terminal       from './components/Terminal/Terminal';
import CRMView        from './components/CRM/CRMView';
import MarketFeed     from './components/MarketFeed/MarketFeed';
import BrokerMonitor  from './components/BrokerMonitor/BrokerMonitor';
import SuperAdmin     from './components/SuperAdmin/SuperAdmin';
import Login          from './components/Login/Login';

import './components/shared.css';
import './App.css';

const MT4_BRIDGE_URL = process.env.REACT_APP_MT4_BRIDGE_URL || '';

const API_URL = process.env.REACT_APP_API_URL || '';

const AppInner = () => {
  // 'terminal' | 'crm' | 'feed' | 'broker' | 'superadmin'
  const [appMode,    setAppMode]    = useState('terminal');
  const [userRole,   setUserRole]   = useState(null);   // null = not logged in
  const [showLogin,  setShowLogin]  = useState(false);

  // ── MT4 bridge ────────────────────────────────────────────────────────
  useEffect(() => {
    // Use the backend bridge for real-time data when the API is configured,
    // otherwise fall back to the built-in MT4 simulator.
    if (!backendBridge.isConfigured()) {
      if (MT4_BRIDGE_URL) {
        mt4Bridge.connect(MT4_BRIDGE_URL);
      } else {
        mt4Bridge.startSimulator();
      }
    }
    return () => mt4Bridge.disconnect();
  }, []);

  // ── Auto-login from stored JWT ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('vda_token');
    const user  = (() => {
      try { return JSON.parse(localStorage.getItem('vda_user') || 'null'); }
      catch { return null; }
    })();

    if (!token || !user) return;

    if (API_URL) {
      // Validate token against the server to ensure it hasn't expired
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
        .then((data) => {
          setUserRole(data.user.role);
          if (data.user.role === 'super_admin') setAppMode('superadmin');
          else if (data.user.role === 'admin')  setAppMode('broker');
        })
        .catch(() => {
          // Token is invalid / expired – clear storage
          localStorage.removeItem('vda_token');
          localStorage.removeItem('vda_user');
        });
    } else {
      // Demo mode: trust the stored role without a network call
      setUserRole(user.role);
      if (user.role === 'super_admin') setAppMode('superadmin');
      else if (user.role === 'admin')  setAppMode('broker');
    }
  }, []);

  const handleLogin = async (role, token) => {
    setUserRole(role);
    setShowLogin(false);

    // When a real backend token is available, initialise the bridge.
    if (token && backendBridge.isConfigured()) {
      backendBridge.setToken(token);
      // Stop the local simulator if it was running
      mt4Bridge.stopSimulator();
      await backendBridge.initialize();
    }

    if (role === 'super_admin') setAppMode('superadmin');
    else if (role === 'admin') setAppMode('broker');
  };

  const handleLogout = () => {
    localStorage.removeItem('vda_token');
    localStorage.removeItem('vda_user');
    backendBridge.disconnect();
    setUserRole(null);
    setAppMode('terminal');

    // Restart local simulator after logout
    if (!backendBridge.isConfigured()) {
      mt4Bridge.startSimulator();
    }
  };

  const modeLabel = {
    terminal:   'Trading Terminal · MetaTrader 4 Bridge',
    crm:        'CRM System',
    feed:       'Market Feed',
    broker:     'Broker Risk Monitor',
    superadmin: 'Super Admin Control Panel',
  };

  return (
    <div className="terminal-root">
      {/* ── Login overlay ───────────────────────────────────────────── */}
      {showLogin && <Login onLogin={handleLogin} />}

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="top-bar">
        <span className="logo">VDA</span>
        <span className="logo-sub">{modeLabel[appMode] || modeLabel.terminal}</span>

        {/* App mode toggle */}
        <div className="app-mode-nav">
          <button
            className={`mode-btn${appMode === 'terminal' ? ' mode-active' : ''}`}
            onClick={() => setAppMode('terminal')}
          >
            📈 Terminal
          </button>
          <button
            className={`mode-btn${appMode === 'crm' ? ' mode-active' : ''}`}
            onClick={() => setAppMode('crm')}
          >
            👥 CRM
          </button>
          <button
            className={`mode-btn${appMode === 'feed' ? ' mode-active' : ''}`}
            onClick={() => setAppMode('feed')}
          >
            🎬 Feed
          </button>
          <button
            className={`mode-btn${appMode === 'broker' ? ' mode-active' : ''}`}
            onClick={() => setAppMode('broker')}
            title="Broker Risk Monitor"
          >
            🛡 Broker
          </button>
          {userRole === 'super_admin' && (
            <button
              className={`mode-btn${appMode === 'superadmin' ? ' mode-active' : ''}`}
              onClick={() => setAppMode('superadmin')}
              title="Super Admin Panel"
            >
              👑 Admin
            </button>
          )}
        </div>

        <div className="top-actions">
          {appMode === 'terminal' && !backendBridge.isConfigured() && (
            <button
              className="top-btn"
              title="Restart simulator"
              onClick={() => { mt4Bridge.stopSimulator(); mt4Bridge.startSimulator(); }}
            >
              ↺ Reset Demo
            </button>
          )}
          {userRole ? (
            <button className="top-btn" onClick={handleLogout} title="Log out">
              {userRole === 'super_admin' ? '👑' : userRole === 'admin' ? '🛡' : '👤'} Logout
            </button>
          ) : (
            <button className="top-btn" onClick={() => setShowLogin(true)}>
              🔑 Login
            </button>
          )}
        </div>
      </header>

      {/* ── CRM view ─────────────────────────────────────────────────── */}
      {appMode === 'crm' && <CRMView />}

      {/* ── Market Feed ──────────────────────────────────────────────── */}
      {appMode === 'feed' && <MarketFeed />}

      {/* ── Broker risk monitor ──────────────────────────────────────── */}
      {appMode === 'broker' && (
        <div className="broker-view">
          <BrokerMonitor />
        </div>
      )}

      {/* ── Super Admin panel ─────────────────────────────────────────── */}
      {appMode === 'superadmin' && (
        <div className="broker-view">
          <SuperAdmin />
        </div>
      )}

      {/* ── Trading terminal layout ───────────────────────────────────── */}
      {appMode === 'terminal' && (
        <div className="main-layout">
          {/* Left sidebar: Market Watch + Account */}
          <div className="left-sidebar">
            <MarketWatch />
            <AccountInfo />
          </div>

          {/* Center: Chart + Positions + Terminal */}
          <div className="center-area">
            <Chart />
            <div className="bottom-panels">
              <Positions />
              <Terminal />
            </div>
          </div>

          {/* Right sidebar: Order Panel */}
          <div className="right-sidebar">
            <OrderPanel />
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <AppInner />
  </Provider>
);

export default App;
