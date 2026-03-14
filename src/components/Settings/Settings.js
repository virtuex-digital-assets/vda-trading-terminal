import React, { useState } from 'react';
import './Settings.css';

const SETTINGS_DATA = {
  general: [
    { key: 'platform_name', label: 'Platform Name', type: 'text', value: 'VDA Trading' },
    { key: 'support_email', label: 'Support Email', type: 'text', value: 'support@vda.trade' },
    { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle', value: false },
  ],
  trading: [
    { key: 'max_leverage', label: 'Maximum Leverage', type: 'text', value: '500' },
    { key: 'min_deposit', label: 'Minimum Deposit (USD)', type: 'text', value: '100' },
    { key: 'default_currency', label: 'Default Currency', type: 'select', value: 'USD', options: ['USD', 'EUR', 'GBP'] },
  ],
  payment: [
    { key: 'stripe_enabled', label: 'Enable Stripe', type: 'toggle', value: false },
    { key: 'crypto_enabled', label: 'Enable Crypto Gateway', type: 'toggle', value: false },
    { key: 'bank_enabled', label: 'Enable Bank Transfer', type: 'toggle', value: true },
  ],
  crm: [
    { key: 'crm_lead_auto_assign', label: 'Auto-Assign Leads', type: 'toggle', value: true },
    { key: 'kyc_required', label: 'KYC Required for Withdrawal', type: 'toggle', value: true },
    { key: 'kyc_auto_approve', label: 'Auto-Approve KYC', type: 'toggle', value: false },
  ],
  security: [
    { key: 'two_factor_required', label: 'Require 2FA for All Users', type: 'toggle', value: false },
    { key: 'session_timeout', label: 'Session Timeout (seconds)', type: 'text', value: '3600' },
    { key: 'password_min_length', label: 'Minimum Password Length', type: 'text', value: '8' },
  ],
  notifications: [
    { key: 'chat_enabled', label: 'Enable Chat System', type: 'toggle', value: true },
    { key: 'email_notifications', label: 'Email Notifications', type: 'toggle', value: true },
    { key: 'deposit_alerts', label: 'Deposit Alerts', type: 'toggle', value: true },
  ],
};

const NAV_ITEMS = [
  { key: 'general',       icon: '⚙️',  label: 'General' },
  { key: 'trading',       icon: '📈',  label: 'Trading' },
  { key: 'payment',       icon: '💳',  label: 'Payment' },
  { key: 'crm',           icon: '👥',  label: 'CRM' },
  { key: 'security',      icon: '🔒',  label: 'Security' },
  { key: 'notifications', icon: '🔔',  label: 'Notifications' },
];

function initValues(defs) {
  const out = {};
  defs.forEach((d) => { out[d.key] = d.value; });
  return out;
}

function SettingControl({ def, value, onChange }) {
  if (def.type === 'toggle') {
    return (
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(def.key, e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    );
  }
  if (def.type === 'select') {
    return (
      <select
        className="settings-select"
        value={value}
        onChange={(e) => onChange(def.key, e.target.value)}
      >
        {def.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      className="settings-input"
      type="text"
      value={value}
      onChange={(e) => onChange(def.key, e.target.value)}
    />
  );
}

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [values, setValues] = useState(() => {
    const all = {};
    Object.entries(SETTINGS_DATA).forEach(([cat, defs]) => {
      all[cat] = initValues(defs);
    });
    return all;
  });
  const [savedCategory, setSavedCategory] = useState(null);
  const [unsaved, setUnsaved] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const defs = SETTINGS_DATA[activeCategory] || [];
  const currentValues = values[activeCategory] || {};
  const hasUnsaved = !!unsaved[activeCategory];

  const handleChange = (key, val) => {
    setValues((prev) => ({
      ...prev,
      [activeCategory]: { ...prev[activeCategory], [key]: val },
    }));
    setUnsaved((prev) => ({ ...prev, [activeCategory]: true }));
    setSaveSuccess(false);
  };

  const handleSave = () => {
    setUnsaved((prev) => ({ ...prev, [activeCategory]: false }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="settings-wrap">
      <div className="settings-header">
        <h2>⚙️ Settings</h2>
      </div>

      <div className="settings-layout">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <div className="settings-sidebar">
          <div className="settings-sidebar-title">Categories</div>
          {NAV_ITEMS.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`settings-nav-item${activeCategory === key ? ' active' : ''}`}
              onClick={() => { setActiveCategory(key); setSaveSuccess(false); }}
            >
              <span className="settings-nav-icon">{icon}</span>
              {label}
              {unsaved[key] && (
                <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: '#d29922', display: 'inline-block' }} />
              )}
            </button>
          ))}
        </div>

        {/* ── Main ──────────────────────────────────────────────────────── */}
        <div className="settings-main">
          <div className="settings-section">
            <div className="settings-section-header">
              <span className="settings-section-title">
                {NAV_ITEMS.find((n) => n.key === activeCategory)?.icon}{' '}
                {NAV_ITEMS.find((n) => n.key === activeCategory)?.label} Settings
              </span>
              {hasUnsaved && <span className="settings-unsaved">● Unsaved changes</span>}
            </div>

            <div className="settings-form">
              {defs.map((def) => (
                <div className="setting-row" key={def.key}>
                  <div className="setting-label">
                    <div className="setting-label-text">{def.label}</div>
                  </div>
                  <div className="setting-control">
                    <SettingControl
                      def={def}
                      value={currentValues[def.key]}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="settings-footer">
              <button className="settings-save-btn" onClick={handleSave}>
                Save Changes
              </button>
              {saveSuccess && (
                <div className="save-success">
                  ✓ Settings saved!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
