import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSetView, crmSetRepFilter, crmSetStageFilter } from '../../store/actions';
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
  const { activeView, clients, repFilter } = useSelector((s) => s.crm);

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
          {activeView === 'dashboard' && <CRMDashboard />}
          {activeView === 'clients'   && <ClientList />}
          {activeView === 'pipeline'  && <Pipeline />}
        </div>
      </div>
    </div>
  );
};

export default CRMView;
