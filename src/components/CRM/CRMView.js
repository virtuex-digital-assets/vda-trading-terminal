import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSetView } from '../../store/actions';
import CRMDashboard from './Dashboard/CRMDashboard';
import ClientList from './Clients/ClientList';
import Pipeline from './Pipeline/Pipeline';
import './CRMView.css';

const NAV_ITEMS = [
  { view: 'dashboard', icon: '📊', label: 'Dashboard' },
  { view: 'clients',   icon: '👥', label: 'Clients'   },
  { view: 'pipeline',  icon: '🔀', label: 'Pipeline'  },
];

const CRMView = () => {
  const dispatch = useDispatch();
  const { activeView, clients } = useSelector((s) => s.crm);

  const activeCount = clients.filter((c) => c.stage === 'Active').length;

  return (
    <div className="crm-root">
      <div className="crm-body">
        {/* ── Left navigation ─────────────────────────── */}
        <nav className="crm-nav">
          {NAV_ITEMS.map(({ view, icon, label }) => (
            <button
              key={view}
              className={`crm-nav-item${activeView === view ? ' active' : ''}`}
              onClick={() => dispatch(crmSetView(view))}
            >
              <span className="crm-nav-icon">{icon}</span>
              {label}
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
            </button>
          ))}

          <div className="crm-nav-divider" />

          <div style={{ padding: '6px 16px', fontSize: 10, color: '#3a4a6a' }}>
            ASSIGNED TO
          </div>
          {['Alice K.', 'Bob T.', 'Carol M.'].map((rep) => (
            <div key={rep} style={{ padding: '4px 16px', fontSize: 12, color: '#5566aa' }}>
              • {rep}
            </div>
          ))}
        </nav>

        {/* ── Main content ────────────────────────────── */}
        <div className="crm-content">
          {activeView === 'dashboard' && <CRMDashboard />}
          {activeView === 'clients'   && <ClientList />}
          {activeView === 'pipeline'  && <Pipeline />}
        </div>
      </div>
    </div>
  );
};

export default CRMView;
