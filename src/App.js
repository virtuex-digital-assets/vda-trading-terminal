import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import mt4Bridge from './services/mt4Bridge';

import MarketWatch from './components/MarketWatch/MarketWatch';
import Chart from './components/Chart/Chart';
import OrderPanel from './components/OrderPanel/OrderPanel';
import Positions from './components/Positions/Positions';
import AccountInfo from './components/AccountInfo/AccountInfo';
import Terminal from './components/Terminal/Terminal';
import CRMView from './components/CRM/CRMView';
import MarketFeed from './components/MarketFeed/MarketFeed';

import './components/shared.css';
import './App.css';

const MT4_BRIDGE_URL = process.env.REACT_APP_MT4_BRIDGE_URL || '';

const AppInner = () => {
  const [appMode, setAppMode] = useState('terminal'); // 'terminal' | 'crm' | 'feed'

  useEffect(() => {
    if (MT4_BRIDGE_URL) {
      mt4Bridge.connect(MT4_BRIDGE_URL);
    } else {
      mt4Bridge.startSimulator();
    }
    return () => mt4Bridge.disconnect();
  }, []);

  return (
    <div className="terminal-root">
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="top-bar">
        <span className="logo">VDA</span>
        <span className="logo-sub">
          {appMode === 'crm' ? 'CRM System' : appMode === 'feed' ? 'Market Feed' : 'Trading Terminal · MetaTrader 4 Bridge'}
        </span>

        {/* App mode toggle */}
        <div className="app-mode-nav">
          <button
            className={`mode-btn${appMode === 'terminal' ? ' mode-active' : ''}`}
            onClick={() => setAppMode('terminal')}
          >
            📈 Trading Terminal
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
            🎬 Market Feed
          </button>
        </div>

        <div className="top-actions">
          {appMode === 'terminal' && (
            <button
              className="top-btn"
              title="Restart simulator"
              onClick={() => { mt4Bridge.stopSimulator(); mt4Bridge.startSimulator(); }}
            >
              ↺ Reset Demo
            </button>
          )}
        </div>
      </header>

      {/* ── CRM view ─────────────────────────────────────────────────── */}
      {appMode === 'crm' && <CRMView />}

      {/* ── Market Feed (TikTok-style) ───────────────────────────────────── */}
      {appMode === 'feed' && <MarketFeed />}

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
