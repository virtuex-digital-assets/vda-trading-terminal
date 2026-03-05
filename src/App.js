import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import mt4Bridge from './services/mt4Bridge';

import MarketWatch from './components/MarketWatch/MarketWatch';
import Chart from './components/Chart/Chart';
import OrderPanel from './components/OrderPanel/OrderPanel';
import Positions from './components/Positions/Positions';
import AccountInfo from './components/AccountInfo/AccountInfo';
import Terminal from './components/Terminal/Terminal';

import './components/shared.css';
import './App.css';

const MT4_BRIDGE_URL = process.env.REACT_APP_MT4_BRIDGE_URL || '';

const AppInner = () => {
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
        <span className="logo">VDA Trading Terminal</span>
        <span className="logo-sub">MetaTrader 4 Bridge</span>
        <div className="top-actions">
          <button
            className="top-btn"
            title="Restart simulator"
            onClick={() => { mt4Bridge.stopSimulator(); mt4Bridge.startSimulator(); }}
          >
            ↺ Reset Demo
          </button>
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────────────────── */}
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
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <AppInner />
  </Provider>
);

export default App;
