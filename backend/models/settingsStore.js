/**
 * In-memory platform settings store.
 */

// ── Platform Settings ─────────────────────────────────────────────────────────

const platformSettings = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSetting(key) {
  return platformSettings.get(key) || null;
}

function setSetting(key, value, category = 'general', description = '', updatedBy = null) {
  const existing = platformSettings.get(key);
  const entry = {
    key,
    value: String(value),
    category: category || (existing && existing.category) || 'general',
    description: description || (existing && existing.description) || '',
    updatedBy,
    updatedAt: new Date().toISOString(),
  };
  platformSettings.set(key, entry);
  return entry;
}

// ── Seed defaults ─────────────────────────────────────────────────────────────

(function seedSettings() {
  const defaults = [
    { key: 'platform_name',        value: 'VDA Trading',  category: 'general',  description: 'Platform display name' },
    { key: 'maintenance_mode',     value: 'false',        category: 'general',  description: 'Enable maintenance mode' },
    { key: 'max_leverage',         value: '500',          category: 'trading',  description: 'Maximum leverage allowed' },
    { key: 'min_deposit',          value: '100',          category: 'finance',  description: 'Minimum deposit amount (USD)' },
    { key: 'kyc_required',         value: 'true',         category: 'compliance', description: 'Require KYC before trading' },
    { key: 'crm_lead_auto_assign', value: 'true',         category: 'crm',      description: 'Auto-assign new leads' },
    { key: 'chat_enabled',         value: 'true',         category: 'chat',     description: 'Enable live chat feature' },
    { key: 'two_factor_required',  value: 'false',        category: 'security', description: 'Require 2FA for all users' },
  ];
  for (const d of defaults) {
    setSetting(d.key, d.value, d.category, d.description, null);
  }
})();

module.exports = {
  platformSettings,
  getSetting,
  setSetting,
};
