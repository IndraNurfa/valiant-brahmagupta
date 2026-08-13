'use strict';

const { Router } = require('express');
const { check }  = require('../controllers/checkController');

const router = Router();

router.post('/check', check);

module.exports = router;
