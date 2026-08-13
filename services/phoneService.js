'use strict';

/**
 * Normalise a raw phone input to the bare local number.
 *
 * Strip priority (first match wins):
 *   +62... → strip "+62"
 *    62... → strip "62"
 *     0... → strip "0"
 * Everything else is returned as-is.
 *
 * Examples:
 *   "+62812345678" → "812345678"
 *   "62812345678"  → "812345678"
 *   "0812345678"   → "812345678"
 *   "812345678"    → "812345678"
 *
 * @param {string} raw
 * @returns {string}
 */
function normalisePhone(raw) {
  const clean = (raw || '').replace(/-/g, '').trim();
  if (clean.startsWith('+62')) return clean.slice(3);
  if (clean.startsWith('62'))  return clean.slice(2);
  if (clean.startsWith('0'))   return clean.slice(1);
  return clean;
}

module.exports = { normalisePhone };
