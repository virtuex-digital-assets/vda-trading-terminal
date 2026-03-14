import React from 'react';
import { useSelector } from 'react-redux';
import CRMView from './components/CRM/CRMView';
import './App.css';

const App = () => {
  const brokerName = useSelector((s) => s.broker?.settings?.brokerName || 'VDA Markets');
  const brokerLogo = useSelector((s) => s.broker?.settings?.brokerLogo || '🏦');
  return (
    <div className="crm-app">
      <header className="crm-app-header">
        <span className="crm-app-logo">{brokerLogo}</span>
        <span className="crm-app-title">{brokerName} CRM</span>
        <span className="crm-app-version">v2.0 · Broker Platform</span>
      </header>
      <main className="crm-app-main">
        <CRMView />
      </main>
    </div>
  );
};

export default App;
