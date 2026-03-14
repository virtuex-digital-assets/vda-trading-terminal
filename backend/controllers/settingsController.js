/**
 * Settings controller.
 *
 * Manages platform-wide configuration settings.
 */

const {
  platformSettings,
  getSetting,
  setSetting,
} = require('../models/settingsStore');

// ── Settings ──────────────────────────────────────────────────────────────────

function listSettings(req, res) {
  try {
    let list = [...platformSettings.values()];
    if (req.query.category) {
      list = list.filter((s) => s.category === req.query.category);
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getSettingHandler(req, res) {
  try {
    const setting = getSetting(req.params.key);
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function updateSetting(req, res) {
  try {
    const { value, category, description } = req.body;
    if (value === undefined) return res.status(400).json({ error: 'value is required' });
    const setting = setSetting(req.params.key, value, category, description, req.user.id);
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function bulkUpdateSettings(req, res) {
  try {
    const updates = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Request body must be an array of {key, value} objects' });
    }
    const results = [];
    for (const item of updates) {
      if (!item.key || item.value === undefined) continue;
      results.push(setSetting(item.key, item.value, item.category, item.description, req.user.id));
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listSettings,
  getSetting: getSettingHandler,
  updateSetting,
  bulkUpdateSettings,
};
