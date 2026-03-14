import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSetView, crmSetRepFilter, crmSetStageFilter } from '../../store/actions';
import CRMDashboard from './Dashboard/CRMDashboard';
import ClientList from './Clients/ClientList';
import KYCView from './KYC/KYCView';
import WalletsView from './Wallets/WalletsView';
import TradingAccountsView from './TradingAccounts/TradingAccountsView';
import AffiliatesView from './Affiliates/AffiliatesView';
import ReportsView from './Reports/ReportsView';
import TicketsView from './Tickets/TicketsView';
import SettingsView from './Settings/SettingsView';
import NotificationCenter from './Notifications/NotificationCenter';
import './CRMView.css';

const NAV_ITEMS = [
  { view: 'dashboard',        icon: '📊', label: 'Dashboard',        section: 'main'    },
  { view: 'clients',          icon: '👥', label: 'Clients',           section: 'main'    },
  { view: 'kyc',              icon: '🔍', label: 'KYC Verification',  section: 'main'    },
  { view: 'wallets',          icon: '💳', label: 'Wallets',           section: 'finance' },
  { view: 'trading-accounts', icon: '📈', label: 'Trading Accounts',  section: 'finance' },
  { view: 'affiliates',       icon: '🤝', label: 'IB Partners',       section: 'finance' },
  { view: 'transactions',     icon: '💱', label: 'Transactions',      section: 'finance' },
  { view: 'reports',          icon: '📋', label: 'Reports',           section: 'tools'   },
  { view: 'tickets',          icon: '🎫', label: 'Support Tickets',   section: 'tools'   },
  { view: 'settings',         icon: '⚙️', label: 'Settings',          section: 'tools'   },
];

const SECTIONS = [
  { key: 'main',    label: 'MANAGEMENT' },
  { key: 'finance', label: 'FINANCE'    },
  { key: 'tools',   label: 'TOOLS'      },
];

const CRMView = () => {
  const dispatch = useDispatch();
  const { activeView, clients, repFilter } = useSelector((s) => s.crm);
  const unreadCount = useSelector((s) =>
    s.broker.notifications.filter((n) => !n.read).length
  );

  const activeCount = clients.filter((c) => c.stage === 'Active').length;
  const REPS = ['Alice K.', 'Bob T.', 'Carol M.'];

  const handleRepClick = (rep) => {
    const next = repFilter === rep ? 'All' : rep;
    dispatch(crmSetRepFilter(next));
    dispatch(crmSetStageFilter('All'));
    dispatch(crmSetView('clients'));
  };

  return (
    <div className="crm-root">
      {/* ── Top bar ──────────────────────────────────── */}
      <div className="crm-topbar">
        <div className="crm-topbar-left">
          <span style={{ fontSize: 12, color: '#5566aa' }}>VDA Markets CRM · Admin</span>
        </div>
        <div className="crm-topbar-right">
          <NotificationCenter />
        </div>
      </div>

      <div className="crm-body">
        {/* ── Left navigation ─────────────────────────── */}
        <nav className="crm-nav">
          {SECTIONS.map(({ key, label }) => (
            <React.Fragment key={key}>
              <div className="crm-nav-section">{label}</div>
              {NAV_ITEMS.filter((item) => item.section === key).map(({ view, icon, label: itemLabel }) => (
                <button
                  key={view}
                  className={`crm-nav-item${activeView === view ? ' active' : ''}`}
                  onClick={() => dispatch(crmSetView(view))}
                >
                  <span className="crm-nav-icon">{icon}</span>
                  {itemLabel}
                  {view === 'clients' && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#5566aa' }}>
                      {clients.length}
                    </span>
                  )}
                  {view === 'dashboard' && activeCount > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#66bb6a' }}>
                      {activeCount} live
                    </span>
                  )}
                  {view === 'tickets' && unreadCount > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#ffa726' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </React.Fragment>
          ))}

          <div className="crm-nav-divider" />

          <div className="crm-nav-section">ASSIGNED TO</div>
          {REPS.map((rep) => {
            const count = clients.filter((c) => c.assignedTo === rep).length;
            const isActive = repFilter === rep;
            return (
              <button
                key={rep}
                className={`crm-nav-item${isActive ? ' active' : ''}`}
                style={{ fontSize: 12, paddingLeft: 20 }}
                onClick={() => handleRepClick(rep)}
              >
                <span className="crm-nav-icon" style={{ fontSize: 11 }}>👤</span>
                {rep}
                <span style={{ marginLeft: 'auto', fontSize: 10, color: isActive ? '#4fc3f7' : '#3a4a6a' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Main content ────────────────────────────── */}
        <div className="crm-content">
          {activeView === 'dashboard'        && <CRMDashboard />}
          {activeView === 'clients'          && <ClientList />}
          {activeView === 'kyc'              && <KYCView />}
          {activeView === 'wallets'          && <WalletsView />}
          {activeView === 'trading-accounts' && <TradingAccountsView />}
          {activeView === 'affiliates'       && <AffiliatesView />}
          {activeView === 'transactions'     && <WalletsView />}
          {activeView === 'reports'          && <ReportsView />}
          {activeView === 'tickets'          && <TicketsView />}
          {activeView === 'settings'         && <SettingsView />}
        </div>
      </div>
    </div>
  );
};

export default CRMView;
