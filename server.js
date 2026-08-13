'use strict';

require('dotenv').config();

const app  = require('./app');
const log  = require('./lib/logger');
const db   = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  await db.connect();

  app.listen(PORT, () => {
    log.info({ port: PORT }, `Server listening on http://localhost:${PORT}`);
  });
})();
