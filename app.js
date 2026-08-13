'use strict';

const express = require('express');
const path    = require('path');
const apiRouter = require('./routes/api');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());

// ── Static frontend ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

module.exports = app;
