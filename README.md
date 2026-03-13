# VDA Trading Terminal

A React-based trading terminal application with real-time market data, virtual wallet, and trading features.

## Features

- Real-time market data display
- Virtual wallet management
- Buy and sell order execution
- Portfolio tracking
- Trade history

## Technology Stack

- **React** - UI framework
- **Redux** - State management
- **Axios** - HTTP client for market data APIs
- **React Scripts** - Build tooling (Create React App)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## License

This project is proprietary to Virtuex Digital Assets.
This is a **trading app** that runs in your web browser. It shows live prices and lets you practice buying and selling currencies and other assets. 📈

---

> ### 🚀 Ready to put it online?
> **[➡ DEPLOY.md — Step-by-step go-live guide (plain English)](./DEPLOY.md)**
> *(Or run `./go-live.sh` to check your setup and get the exact steps printed for you!)*

---

## 👀 Want to see it right now?

**Just click this link and it opens in your browser — nothing to install!**

> 👉 **[https://virtuex-digital-assets.github.io/vda-trading-terminal](https://virtuex-digital-assets.github.io/vda-trading-terminal)**

That's it! The app will open and prices will start moving on their own. 🎉

---

## 💻 Want to run it on your own computer instead?

Follow these steps **one at a time**. Take your time — there's no rush!

---

### Step 1 — Download Node.js

Node.js is a helper program that lets the app run on your computer.

1. Go to 👉 **[https://nodejs.org](https://nodejs.org)**
2. Click the big green button that says **"LTS"** (that's the safe, stable version)
3. Download and install it — just click **Next** on everything, like any normal program
4. When it's done, close and reopen your terminal / command prompt

---

### Step 2 — Open your terminal (the black text window)

- **Windows**: Press the `Windows` key, type `cmd`, press `Enter`
- **Mac**: Press `Cmd + Space`, type `Terminal`, press `Enter`

---

### Step 3 — Go to the project folder

Type this and press `Enter` (change the path to wherever you saved the project):

```
cd C:\path\to\vda-trading-terminal
```

*(On Mac it looks like: `cd /Users/yourname/vda-trading-terminal`)*

---

### Step 4 — Install the app's pieces (first time only)

Type this and press `Enter`:

```
npm install
```

⏳ Wait for it to finish. You'll see a lot of text scrolling — that's normal! It usually takes about 1–2 minutes.

---

### Step 5 — Start the app

Type this and press `Enter`:

```
npm start
```

⏳ Wait about 10–20 seconds. When you see:

```
Compiled successfully!
```

...the app is ready! 🎉

---

### Step 6 — Open it in your browser

Open **Google Chrome**, **Firefox**, or any browser and go to:

> 👉 **[http://localhost:3000](http://localhost:3000)**

The trading terminal will open and prices will start moving automatically. No real money is involved — it's just a demo!

---

### Step 7 — How to stop it

When you're done, go back to the terminal and press:

```
Ctrl + C
```

That turns off the app.

---

## 🌐 Make it live online (so anyone in the world can visit it)

📖 **[Full step-by-step guide → DEPLOY.md](./DEPLOY.md)**  *(also try `./go-live.sh` for a guided checklist!)*

The app is already set up to go live for **free** using something called **GitHub Pages**. Think of it like GitHub hosting your website for you. You just need to flip one switch — here's how:

---

### Step 1 — Go to your GitHub repository

Open your browser and go to:

> 👉 **[https://github.com/virtuex-digital-assets/vda-trading-terminal](https://github.com/virtuex-digital-assets/vda-trading-terminal)**

---

### Step 2 — Open the Settings

Click the **"Settings"** tab near the top of the page (it has a gear icon ⚙️).

---

### Step 3 — Find "Pages" in the left menu

On the left side of the Settings page, scroll down and click **"Pages"**.

---

### Step 4 — Turn on GitHub Pages

Under **"Source"**, click the dropdown that says **"None"** and change it to **"GitHub Actions"**.

Then click **Save**.

---

### Step 5 — Merge this PR to main

Once the PR is merged into the `main` branch, GitHub will automatically:
1. Build the app ⚙️
2. Put it live on the internet 🚀

This takes about **2–3 minutes**.

---

### Step 6 — Visit your live site!

Once it's done, your site will be live at:

> 👉 **[https://virtuex-digital-assets.github.io/vda-trading-terminal](https://virtuex-digital-assets.github.io/vda-trading-terminal)**

Just open that link in any browser — from any device, anywhere in the world! 🌍

> Every time you push new code to `main`, the site automatically updates itself. You don't have to do anything!

---

## 🏠 Use your own domain name (e.g. `www.mysite.com`)

Want the site to have your own web address instead of the long GitHub one? Here's how — step by step.

---

### What you need first

You need to **buy a domain name** (like `mysite.com`). You can buy one from:
- [Namecheap](https://www.namecheap.com) (~$10/year)
- [Google Domains](https://domains.google) (~$12/year)
- [GoDaddy](https://www.godaddy.com) (~$12/year)

Once you've bought one, come back here and follow these steps:

---

### Step A — Point your domain to GitHub

1. Log in to wherever you bought your domain (e.g. Namecheap)
2. Find the **DNS settings** for your domain (sometimes called "Advanced DNS" or "Manage DNS")
3. Add these **4 records** (they tell the internet to send visitors to GitHub):

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

4. Also add this record (for the `www.` version):

| Type | Host | Value |
|---|---|---|
| CNAME | www | virtuex-digital-assets.github.io |

5. Save the changes. DNS can take up to **24 hours** to spread around the internet (usually much faster).

---

### Step B — Tell GitHub your domain name

1. Go back to your GitHub repo → **Settings** → **Pages**
2. Under **"Custom domain"**, type in your domain (e.g. `www.mysite.com`)
3. Click **Save**
4. GitHub will automatically turn on **HTTPS** (the padlock 🔒) for free — just tick "Enforce HTTPS" if it's not already ticked

---

### Step C — Add a CNAME file to the project

This file tells GitHub "remember my custom domain even after a new deploy":

1. In the `public/` folder of this project, create a file called `CNAME` (no file extension)
2. Inside it, put just your domain name on one line, for example:

```
www.mysite.com
```

3. Save it, commit it, and push to `main` — GitHub Pages will pick it up automatically

---

### Step D — Visit your site on your new domain!

After DNS has updated (give it up to 24 hours), open your browser and go to:

> 👉 **`https://www.mysite.com`**

Your trading terminal will load on your very own web address! 🎉

---

## 🆕 CRM System — standalone repository

The CRM module that lives inside this trading terminal has its own dedicated repository:

> 👉 **[https://github.com/virtuex-digital-assets/vda-crm-system](https://github.com/virtuex-digital-assets/vda-crm-system)**

Once deployed, the standalone CRM will be live at:

> 👉 **[https://virtuex-digital-assets.github.io/vda-crm-system](https://virtuex-digital-assets.github.io/vda-crm-system)**

---

### How to copy the CRM code into the new repo

The CRM source files live in this repo. Follow these steps **once** to push them into `vda-crm-system`.

> ⚠️ You need **Node.js** and **Git** installed before starting (see the steps earlier in this README).

---

#### Step 1 — Clone the new CRM repo

Open your terminal and type:

```
git clone https://github.com/virtuex-digital-assets/vda-crm-system.git
cd vda-crm-system
```

---

#### Step 2 — Bootstrap a React app in that folder

```
npx create-react-app .
```

⏳ This takes about 2 minutes. When it's done you'll see "Happy hacking!"

---

#### Step 3 — Copy the CRM source files across

From the `vda-trading-terminal` folder, copy these into the new repo:

| Copy this from `vda-trading-terminal/` | Into `vda-crm-system/` |
|---|---|
| `src/components/CRM/` | `src/components/CRM/` |
| `src/components/shared.css` | `src/components/shared.css` |
| `src/store/` | `src/store/` |

Then replace `vda-crm-system/src/App.js` with:

```jsx
import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import CRMView from './components/CRM/CRMView';
import './components/shared.css';

const App = () => (
  <Provider store={store}>
    <div style={{ background: '#0d1b2a', minHeight: '100vh' }}>
      <header style={{ padding: '10px 20px', background: '#0a1628', color: '#c0cfe8', fontSize: 18, fontWeight: 700 }}>
        VDA CRM System
      </header>
      <CRMView />
    </div>
  </Provider>
);

export default App;
```

---

#### Step 4 — Install the extra packages

```
npm install redux react-redux
```

---

#### Step 5 — Test it locally

```
npm start
```

Open **[http://localhost:3000](http://localhost:3000)** — the CRM should load.

---

#### Step 6 — Commit and push to GitHub

```
git add .
git commit -m "feat: add standalone CRM app"
git push
```

---

#### Step 7 — Enable GitHub Pages (make it live)

1. Go to 👉 **[https://github.com/virtuex-digital-assets/vda-crm-system/settings/pages](https://github.com/virtuex-digital-assets/vda-crm-system/settings/pages)**
2. Under **Source**, choose **GitHub Actions**
3. Click **Save**

GitHub will automatically build and deploy the CRM — it will be live in about 2 minutes at:

> 👉 **[https://virtuex-digital-assets.github.io/vda-crm-system](https://virtuex-digital-assets.github.io/vda-crm-system)**

---

## 🤔 What can I do in the app?

Here's what you'll see when you open it:

| What you see | What it does |
|---|---|
| **Market Watch** (left panel) | Shows live prices for 10 currencies and assets like Gold and Bitcoin |
| **Chart** (middle) | Shows a price chart — you can switch between different time views |
| **Order Panel** (right) | Where you click BUY or SELL to practice placing a trade |
| **Positions** (bottom) | Shows trades you have open right now |
| **History** | Shows trades you already closed |
| **Account Info** | Shows your pretend balance and profit/loss |

---

## 🪙 Which assets are in the app?

`EURUSD` · `GBPUSD` · `USDJPY` · `XAUUSD` (Gold) · `USDCHF` · `AUDUSD` · `USDCAD` · `NZDUSD` · `BTCUSD` · `ETHUSD`

---

## ❓ Something not working?

| Problem | Fix |
|---|---|
| *"npm is not recognized"* | You need to install Node.js (see Step 1 above) |
| *"localhost:3000 can't be reached"* | Make sure you ran `npm start` and waited for "Compiled successfully!" |
| *Page is blank or broken* | Try a hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) |

---

## 🗄️ Database Setup (optional — for production)

The backend runs fully in-memory by default, so **no database is required** to run the demo.

For a production deployment with PostgreSQL:

```bash
# 1. Create the database
createdb vda_trading

# 2. Apply the schema (tables, indexes, triggers)
psql -d vda_trading -f database/schema.sql

# 3. Load demo / seed data (users, accounts, sample orders)
psql -d vda_trading -f database/seeds.sql
```

**Demo credentials loaded by the seed file:**

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@vda.trade | SuperAdmin1234! |
| Admin/Broker | admin@vda.trade | Admin1234! |
| Demo Trader | demo@vda.trade | Demo1234! |
| Trader 2 | trader2@vda.trade | Trader1234! |

> ⚠️ **CRITICAL**: Change **all** passwords immediately before deploying to any environment other than local development (staging, production, or any internet-accessible server).

For incremental schema upgrades use the numbered migration files in `database/migrations/`.

---

## License

MIT © Virtuex Digital Assets
