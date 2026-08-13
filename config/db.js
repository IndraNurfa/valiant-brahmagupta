'use strict';

const mysql = require('mysql2/promise');
const log = require('../lib/logger');

let pool = null;

/**
 * Initialise and return the MySQL connection pool.
 * Safe to call multiple times — pool is created only once.
 *
 * @returns {Promise<mysql.Pool>}
 */
async function connect() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0,
  });

  try {
    await pool.execute('SELECT 1');
    log.info('DB connected successfully');
  } catch (err) {
    log.warn({ err: err.message }, 'DB could not connect at startup — will retry per-request');
  }

  return pool;
}

/**
 * Returns the active pool. Throws if connect() was never called.
 *
 * @returns {mysql.Pool}
 */
function getPool() {
  if (!pool) throw new Error('DB pool not initialised — call connect() first');
  return pool;
}

module.exports = { connect, getPool };
