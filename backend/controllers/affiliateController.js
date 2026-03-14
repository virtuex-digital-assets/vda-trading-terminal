/**
 * Affiliate / IB Partner controller.
 */

const affiliateService = require('../services/affiliateService');

// ── Self-registration ──────────────────────────────────────────────────────

/**
 * GET /api/affiliates/me
 * Returns authenticated user's affiliate profile.
 */
function getMyProfile(req, res) {
  const affiliate = affiliateService.getAffiliateByUserId(req.user.id);
  if (!affiliate) return res.status(404).json({ error: 'Not registered as an affiliate' });

  const referrals   = affiliateService.getReferralsByAffiliate(affiliate.id);
  const commissions = affiliateService.listCommissions(affiliate.id);
  const payouts     = affiliateService.listPayouts(affiliate.id);

  res.json({ affiliate, referrals, commissions, payouts });
}

/**
 * POST /api/affiliates/register
 * Body: { name, email }
 * Registers authenticated user as an affiliate.
 */
function register(req, res) {
  const { name, email } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  if (!email || !email.trim()) return res.status(400).json({ error: 'email is required' });

  try {
    const affiliate = affiliateService.createAffiliate({
      userId: req.user.id,
      name:   name.trim(),
      email:  email.trim(),
    });
    res.status(201).json({ affiliate });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * POST /api/affiliates/payout
 * Body: { amount, method?, reference? }
 * Requests a commission payout.
 */
function requestPayout(req, res) {
  const affiliate = affiliateService.getAffiliateByUserId(req.user.id);
  if (!affiliate) return res.status(404).json({ error: 'Not registered as an affiliate' });

  const { amount, method, reference } = req.body;
  if (!amount || isNaN(parseFloat(amount))) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  try {
    const payout = affiliateService.requestPayout({
      affiliateId: affiliate.id,
      amount:      parseFloat(amount),
      method,
      reference,
    });
    res.status(201).json({ payout });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ── Admin endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/affiliates/admin/summary
 * Returns platform-wide affiliate statistics.
 */
function getSummary(req, res) {
  res.json(affiliateService.getAffiliateSummary());
}

/**
 * GET /api/affiliates/admin/list
 * Lists all affiliates.
 * Query: ?status=active&brokerId=<id>
 */
function listAll(req, res) {
  const { status, brokerId } = req.query;
  const affiliates = affiliateService.listAffiliates({ status, brokerId });
  res.json({ affiliates, total: affiliates.length });
}

/**
 * PATCH /api/affiliates/admin/:id
 * Body: { status, commissionType, commissionRate, tier }
 * Updates affiliate settings.
 */
function updateAffiliate(req, res) {
  const affiliate = affiliateService.updateAffiliate(req.params.id, req.body);
  if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });
  res.json({ affiliate });
}

/**
 * GET /api/affiliates/admin/payouts
 * Lists all payout requests.
 * Query: ?status=pending
 */
function listPayouts(req, res) {
  const { status } = req.query;
  const payouts = affiliateService.listAllPayouts({ status });
  res.json({ payouts, total: payouts.length });
}

/**
 * PATCH /api/affiliates/admin/payouts/:id
 * Body: { status: 'paid'|'approved'|'rejected' }
 * Processes a payout request.
 */
function processPayoutRequest(req, res) {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  const payout = affiliateService.updatePayoutStatus(req.params.id, status);
  if (!payout) return res.status(404).json({ error: 'Payout not found' });
  res.json({ payout });
}

module.exports = {
  getMyProfile,
  register,
  requestPayout,
  getSummary,
  listAll,
  updateAffiliate,
  listPayouts,
  processPayoutRequest,
};
