'use strict';

const { getPool } = require('../config/db');
const log = require('../lib/logger');

/**
 * Look up the user role for a normalised phone number.
 * Returns the raw DB row or null if no match.
 *
 * @param {string} normalisedPhone
 * @returns {Promise<{ role_id: number, role_desc: string } | null>}
 */
async function lookupRole(normalisedPhone) {
  const sql = `
    SELECT u.role_id, r.\`desc\` AS role_desc
    FROM users u
    LEFT JOIN mst_roles r ON u.role_id = r.role_id
    WHERE u.phone_number = ?
    LIMIT 1
  `;
  const [rows] = await getPool().execute(sql, [normalisedPhone]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

/**
 * Derive the role label from a DB row.
 * Returns the raw desc from mst_roles, or null if no match / empty desc.
 *
 * @param {{ role_id: number, role_desc: string } | null} dbRow
 * @returns {string | null}
 */
function buildRoleLabel(dbRow) {
  if (!dbRow) return null;
  return dbRow.role_desc || null;
}

/**
 * Combined helper: look up role and return its label.
 * DB errors or timeouts are caught here — they never block the OTP call.
 *
 * @param {string} normalisedPhone
 * @returns {Promise<string | null>}
 */
async function getRoleLabel(normalisedPhone) {
  const timeoutMs = 3000;
  let timeoutId;

  const dbTimeout = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      log.warn({ phone: normalisedPhone }, '[DB] Query timed out');
      resolve(null);
    }, timeoutMs);
  });

  const dbQuery = (async () => {
    try {
      const row = await lookupRole(normalisedPhone);
      return buildRoleLabel(row);
    } catch (err) {
      log.error({ err: err.message }, '[DB] Query error — treating as no match');
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  })();

  return Promise.race([dbQuery, dbTimeout]);
}

module.exports = { getRoleLabel };
