import React from 'react';
import CRMView from './components/CRM/CRMView';
import './App.css';

const App = () => (
  <div className="crm-app">
    <header className="crm-app-header">
      <span className="crm-app-logo">📋</span>
      <span className="crm-app-title">VDA CRM System</span>
      <span className="crm-app-subtitle">Client Relationship Management</span>
    </header>
    <main className="crm-app-main">
      <CRMView />
    </main>
  </div>
);

export default App;
