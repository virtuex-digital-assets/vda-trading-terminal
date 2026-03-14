import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { brokerUpdateSettings } from '../../../store/actions';
import './SettingsView.css';

const TIMEZONES = ['UTC', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+8', 'UTC+9', 'UTC-5', 'UTC-8'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'JPY'];

const ROLES = [
  {
    role: 'Super Admin',
    icon: '👑',
    color: '#ab47bc',
    permissions: [
      'All platform access',
      'Manage user roles',
      'Broker settings',
      'Financial reports',
      'Client data export',
    ],
  },
  {
    role: 'Broker Admin',
    icon: '🏢',
    color: '#4fc3f7',
    permissions: [
      'Client management',
      'KYC review',
      'Trading accounts',
      'Support tickets',
      'IB management',
    ],
  },
  {
    role: 'Manager',
    icon: '📊',
    color: '#66bb6a',
    permissions: [
      'View clients',
      'KYC review',
      'Support tickets',
      'View reports',
    ],
  },
  {
    role: 'Support Agent',
    icon: '🎧',
    color: '#ffa726',
    permissions: [
      'View clients',
      'Manage tickets',
      'Reply to tickets',
    ],
  },
  {
    role: 'Client',
    icon: '👤',
    color: '#8899bb',
    permissions: [
      'View own account',
      'Submit tickets',
      'KYC upload',
      'Deposit/Withdraw',
    ],
  },
];

const SettingsView = () => {
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.broker.settings);

  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(
      brokerUpdateSettings({
        ...form,
        defaultLeverage: Number(form.defaultLeverage),
        maxLeverage: Number(form.maxLeverage),
        minDeposit: Number(form.minDeposit),
      })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="view-container">
      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Broker Settings</h2>
          <span className="view-subtitle">Configure platform and white-label settings</span>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <form className="settings-body" onSubmit={handleSave}>
        <div className="settings-cols">
          {/* ── Left: Broker Profile ── */}
          <div className="panel">
            <div className="panel-title">Broker Profile</div>

            <div className="form-row">
              <label className="form-label">Broker Name</label>
              <input
                className="form-input"
                name="brokerName"
                value={form.brokerName}
                onChange={handleChange}
                placeholder="VDA Markets"
              />
            </div>
            <div className="form-row">
              <label className="form-label">Logo Emoji</label>
              <input
                className="form-input"
                name="brokerLogo"
                value={form.brokerLogo}
                onChange={handleChange}
                placeholder="🏦"
                maxLength={4}
              />
              <span className="form-hint">Used as brand icon across the platform</span>
            </div>
            <div className="form-row">
              <label className="form-label">Base Currency</label>
              <select
                className="form-input"
                name="currency"
                value={form.currency}
                onChange={handleChange}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Support Email</label>
              <input
                className="form-input"
                name="supportEmail"
                type="email"
                value={form.supportEmail}
                onChange={handleChange}
                placeholder="support@broker.com"
              />
            </div>
            <div className="form-row">
              <label className="form-label">Timezone</label>
              <select
                className="form-input"
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Right: Trading Settings ── */}
          <div className="panel">
            <div className="panel-title">Trading Settings</div>

            <div className="form-row">
              <label className="form-label">Default Leverage</label>
              <div className="input-with-unit">
                <span className="unit-prefix">1:</span>
                <input
                  className="form-input"
                  name="defaultLeverage"
                  type="number"
                  min="1"
                  max="2000"
                  value={form.defaultLeverage}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Max Leverage</label>
              <div className="input-with-unit">
                <span className="unit-prefix">1:</span>
                <input
                  className="form-input"
                  name="maxLeverage"
                  type="number"
                  min="1"
                  max="2000"
                  value={form.maxLeverage}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Minimum Deposit</label>
              <div className="input-with-unit">
                <span className="unit-prefix">{form.currency || 'USD'}</span>
                <input
                  className="form-input"
                  name="minDeposit"
                  type="number"
                  min="0"
                  value={form.minDeposit}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="settings-divider" />

            {/* Leverage presets */}
            <div className="panel-title" style={{ marginTop: 0 }}>Quick Leverage Presets</div>
            <div className="preset-pills">
              {[50, 100, 200, 500, 1000].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  className={`preset-pill${Number(form.defaultLeverage) === lev ? ' active' : ''}`}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, defaultLeverage: lev }));
                    setSaved(false);
                  }}
                >
                  1:{lev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── White-Label Preview ── */}
        <div className="panel">
          <div className="panel-title">White-Label Brand Preview</div>
          <div className="brand-preview">
            <div className="brand-logo">{form.brokerLogo || '🏦'}</div>
            <div className="brand-info">
              <div className="brand-name">{form.brokerName || 'Your Broker'}</div>
              <div className="brand-meta">
                {form.currency} · {form.timezone} · support: {form.supportEmail}
              </div>
              <div className="brand-trading">
                Default leverage 1:{form.defaultLeverage} · Max 1:{form.maxLeverage} ·
                Min deposit {form.currency} {form.minDeposit}
              </div>
            </div>
            <div className="brand-badge">LIVE</div>
          </div>
        </div>

        {/* ── Role Management ── */}
        <div className="panel">
          <div className="panel-title">User Role Management</div>
          <div className="roles-grid">
            {ROLES.map((r) => (
              <div key={r.role} className="role-card" style={{ borderTopColor: r.color }}>
                <div className="role-header">
                  <span className="role-icon">{r.icon}</span>
                  <span className="role-name" style={{ color: r.color }}>{r.role}</span>
                </div>
                <ul className="role-permissions">
                  {r.permissions.map((p) => (
                    <li key={p} className="role-perm">
                      <span className="perm-dot" style={{ background: r.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Save bar ── */}
        <div className="save-bar">
          <span className="save-hint">
            {saved ? '✓ Settings saved successfully.' : 'Make changes above then save.'}
          </span>
          <button type="submit" className={`btn-primary${saved ? ' btn-saved' : ''}`}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
