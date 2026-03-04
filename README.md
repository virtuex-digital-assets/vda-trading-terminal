# VDA Trading Terminal – MetaTrader 4

A fully-featured browser-based trading terminal that mirrors the MetaTrader 4 (MT4) experience. Built with **React 17**, **Redux**, and an HTML5 Canvas charting engine.

![VDA Trading Terminal](https://github.com/user-attachments/assets/a222cdf7-c337-47be-94c9-011c123b3a3f)

---

## 🚀 How to View / Run the Terminal

### Step 1 — Prerequisites

Make sure you have **Node.js** (v14 or newer) installed.  
Download it from [https://nodejs.org](https://nodejs.org) if you don't have it.

Check your version:
```bash
node -v   # should print v14.x or higher
npm -v    # should print 6.x or higher
```

### Step 2 — Install dependencies (first time only)

Open a terminal in the project folder and run:
```bash
npm install
```

### Step 3 — Start the terminal

```bash
npm start
```

### Step 4 — Open your browser

After a few seconds you will see:
```
Compiled successfully!

  Local:  http://localhost:3000
```

👉 **Go to [http://localhost:3000](http://localhost:3000) in your browser.**

The trading terminal will load immediately. It runs in **demo mode** by default — live simulated prices start ticking every 500 ms without needing a real MT4 connection.

> **To stop the server** press `Ctrl + C` in the terminal.

---

## Features

| Feature | Details |
|---|---|
| **Real-time Market Watch** | Live bid/ask prices, percentage change for 10 symbols |
| **Candlestick Chart** | Canvas-rendered OHLCV chart, 8 timeframes (M1 → W1), price line |
| **Order Panel** | Market (BUY/SELL) and pending (BUY/SELL LIMIT/STOP) orders with lot size, SL, TP |
| **Positions** | Open trades with live floating P&L, one-click close |
| **Pending Orders** | List of active limit/stop orders |
| **Trade History** | Closed-order archive |
| **Account Info** | Balance, equity, margin, free margin, leverage |
| **Terminal Log** | Time-stamped log of all events |
| **MT4 Bridge** | WebSocket bridge for a live MT4 EA/server; falls back to built-in demo simulator |
| **Redux DevTools** | Supported (install the browser extension) |

---

## Other Commands

```bash
npm run build      # Create an optimised production build → build/
npm test           # Run the test suite (28 tests)
```

---

## Connecting a Live MT4 Bridge

Set the `REACT_APP_MT4_BRIDGE_URL` environment variable to the WebSocket URL of your MT4 bridge server before starting:

```bash
REACT_APP_MT4_BRIDGE_URL=ws://localhost:5000 npm start
```

### Expected WebSocket message formats

| Type | Payload |
|---|---|
| `quote` | `{ type, symbol, bid, ask, time }` |
| `candles` | `{ type, symbol, timeframe, data: [{time,open,high,low,close,volume}] }` |
| `candle` | `{ type, symbol, timeframe, data: {time,open,high,low,close,volume} }` |
| `account` | `{ type, data: { balance, equity, margin, … } }` |

If no bridge URL is set the built-in **demo simulator** starts automatically, generating realistic random-walk price data so you can explore the UI without a live MT4 installation.

---

## Project Structure

```
src/
├── App.js / App.css              Main application & layout
├── index.js                      React entry point
├── components/
│   ├── MarketWatch/              Symbol list with live bid/ask
│   ├── Chart/                    Canvas candlestick chart + timeframe switcher
│   ├── OrderPanel/               New order form (market & pending)
│   ├── Positions/                Tabs: Positions / Orders / History
│   ├── AccountInfo/              Account summary + connection indicator
│   ├── Terminal/                 Event log
│   └── shared.css                Shared panel header style
├── store/
│   ├── index.js                  Redux store
│   ├── rootReducer.js            Combined reducers
│   ├── actions/                  Action creators & type constants
│   └── reducers/                 market / orders / account / connection / terminal
├── services/
│   └── mt4Bridge.js              WebSocket bridge + simulator orchestration
└── utils/
    ├── marketSimulator.js        OHLCV candle generator (random-walk)
    └── formatters.js             Price / profit / datetime formatters
```

---

## Symbols Supported

`EURUSD`, `GBPUSD`, `USDJPY`, `XAUUSD`, `USDCHF`, `AUDUSD`, `USDCAD`, `NZDUSD`, `BTCUSD`, `ETHUSD`

---

## License

MIT © Virtuex Digital Assets
