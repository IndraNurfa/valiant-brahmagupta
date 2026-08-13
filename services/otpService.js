'use strict';

const log = require('../lib/logger');

const OTP_API_BASE = process.env.OTP_API_BASE || 'http://localhost:8000/reports/';
const OTP_TIMEOUT_MS = 10_000;

/**
 * Fetch the latest OTP for a normalised phone number.
 *
 * The OTP API expects the phone prefixed with "62":
 *   normalised "812345678" → query param phone = "62812345678"
 *
 * Response shape:
 *   otp_code  — from data.data[0].params.body[0].value_text
 *   sent_at   — from data.data[0].sent_at
 *   failed    — true if the HTTP call itself errored (timeout, non-2xx, parse error)
 *               false if the call succeeded but returned no record ("Not Found")
 *
 * @param {string} normalisedPhone
 * @returns {Promise<{ otp_code: string | null, sent_at: string | null, failed: boolean }>}
 */
async function fetchOtp(normalisedPhone) {
  const phone62 = '62' + normalisedPhone;
  const url = `${OTP_API_BASE}?phone=${encodeURIComponent(phone62)}&limit=1&order=id%20desc`;

  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(OTP_TIMEOUT_MS),
    });
  } catch (err) {
    log.error({ err: err.message }, '[OTP] Fetch error');
    return { otp_code: null, sent_at: null, failed: true };
  }

  if (!res.ok) {
    log.error({ status: res.status, statusText: res.statusText }, '[OTP] Non-2xx response');
    return { otp_code: null, sent_at: null, failed: true };
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    log.error({ err: err.message }, '[OTP] Failed to parse JSON response');
    return { otp_code: null, sent_at: null, failed: true };
  }

  // Navigate: data.data[0].params.body[0].value_text
  //           data.data[0].sent_at
  const record = body?.data?.data?.[0];
  if (!record || record?.params?.body?.[0]?.value !== 'otp') {
    // Successful call but no records → "Not Found"
    return { otp_code: null, sent_at: null, failed: false };
  }

  const otp_code = record?.params?.body?.[0]?.value_text || null;
  const sent_at = record?.sent_at ?? null;

  return { otp_code, sent_at, failed: false };
}

module.exports = { fetchOtp };
