import React from 'react';
import MarketData    from './components/MarketData';
import Wallet        from './components/Wallet';
import OrderForm     from './components/OrderForm';
import OrderHistory  from './components/OrderHistory';

const App = () => (
  <div className="app">
    <header className="app-header">
      <h1>VDA Trading Terminal</h1>
      <span className="subtitle">Virtual paper-trading · Powered by CoinGecko</span>
    </header>
    <main className="app-body">
      <MarketData />
      <Wallet />
      <OrderForm />
      <OrderHistory />
    </main>
  </div>
);

export default App;
