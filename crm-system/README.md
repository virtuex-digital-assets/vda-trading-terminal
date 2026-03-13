# VDA CRM System

A standalone **Client Relationship Management** app built with React and Redux. 📋

---

> ### 🚀 Want to put this online? Read the easy guide first!
> **[➡ DEPLOY.md — Step-by-step go-live guide (plain English)](./DEPLOY.md)**
> *(Or run `./go-live.sh https://github.com/YOUR-USERNAME/vda-crm-system.git` to do it in one command!)*

---

## 👀 Live app

> 👉 **[https://virtuex-digital-assets.github.io/vda-crm-system](https://virtuex-digital-assets.github.io/vda-crm-system)**

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard** | KPI cards (clients, deposits, withdrawals, net funds, P&L, conversion rate), pipeline stage breakdown, top clients by balance, recent activity feed |
| **Client List** | Searchable and filterable table with stage + KYC badges, quick delete |
| **Client Profile** | Tabs: Overview · Accounts · Transactions · Notes. Edit stage, KYC status, assigned rep inline. Record deposits and withdrawals. Add notes. |
| **Pipeline Board** | Kanban board with 7 stages: New Lead → Contacted → KYC Submitted → KYC Verified → Funded → Active → Inactive |
| **Rep Filter** | Sidebar quick-filter by sales rep (Alice K., Bob T., Carol M.) |
| **Seed Data** | 10 realistic demo clients loaded on first run |

---

## 💻 Run locally

```
npm install
npm start
```

Open **[http://localhost:3000](http://localhost:3000)**

---

## 🏗️ Build

```
npm run build
```

---

## 🚀 Deploy to GitHub Pages

📖 **[Full step-by-step guide → DEPLOY.md](./DEPLOY.md)**

**Quick version:**

1. Create a new repo called `vda-crm-system` on GitHub (public, empty)
2. Run the helper script:
   ```bash
   chmod +x go-live.sh
   ./go-live.sh https://github.com/YOUR-USERNAME/vda-crm-system.git
   ```
3. Watch the **Actions** tab — the robot builds and deploys automatically (~2 min)
4. Go to **Settings → Pages → Branch → `gh-pages` → Save**
5. Open 🎉 `https://YOUR-USERNAME.github.io/vda-crm-system`

> **First deploy only:** You need to set the Pages branch to `gh-pages` once in Settings.

---

## 🗂️ Project structure

```
src/
├── App.js                     # Root component — header + CRMView
├── App.css                    # App shell styles
├── index.js                   # React entry point with Redux Provider
├── components/
│   ├── shared.css             # Shared panel styles
│   └── CRM/
│       ├── CRMView.js         # Left nav + view switcher
│       ├── CRMView.css
│       ├── Dashboard/
│       │   ├── CRMDashboard.js    # KPIs, stage bars, top clients, activity
│       │   └── CRMDashboard.css
│       ├── Clients/
│       │   ├── ClientList.js      # Filterable client table + add modal
│       │   ├── ClientList.css
│       │   ├── ClientProfile.js   # Full client record with tabs
│       │   └── ClientProfile.css
│       └── Pipeline/
│           ├── Pipeline.js        # Kanban board
│           └── Pipeline.css
└── store/
    ├── index.js               # Redux store
    ├── rootReducer.js         # combineReducers (CRM only)
    ├── actions/
    │   ├── actionTypes.js
    │   └── index.js
    └── reducers/
        └── crmReducer.js      # Full CRM state + 10 seed clients
```

---

## 🛠️ Tech stack

- **React 17** + **Redux 4** + **react-redux 7**
- **Create React App 4** (no eject)
- **GitHub Actions** → **GitHub Pages** (automatic deployment)

---

## License

MIT © Virtuex Digital Assets
