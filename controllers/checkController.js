'use strict';

const log = require('../lib/logger');
const { normalisePhone } = require('../services/phoneService');
const { getRoleLabel }   = require('../services/roleService');
const { fetchOtp }       = require('../services/otpService');

/**
 * POST /api/check
 *
 * Body:     { phone: string }
 * Response: { role_label, otp_code, sent_at, otp_failed }
 */
async function check(req, res) {
  const rawPhone = req.body?.phone;

  if (!rawPhone || typeof rawPhone !== 'string' || !rawPhone.trim()) {
    log.warn('Request rejected — missing phone field');
    return res.status(400).json({ error: 'phone is required' });
  }

  const normalisedPhone = normalisePhone(rawPhone);
  log.info({ raw: rawPhone, normalised: normalisedPhone }, 'Check request received');

  // DB lookup and OTP fetch run concurrently — fully independent.
  const [role_label, otp] = await Promise.all([
    getRoleLabel(normalisedPhone),
    fetchOtp(normalisedPhone),
  ]);

  log.info({
    normalised:  normalisedPhone,
    role_label,
    otp_found:   !!otp.otp_code,
    otp_code:    otp.otp_code ? '***' : null,  // mask actual code in logs
    otp_failed:  otp.failed,
  }, 'Check request completed');

  const login_instruction = role_label ? (process.env.LOGIN_INSTRUCTION_TEMPLATE || null) : null;

  return res.json({
    role_label,
    otp_code:   otp.otp_code,
    sent_at:    otp.sent_at,
    otp_failed: otp.failed,
    login_instruction,
  });
}

module.exports = { check };
