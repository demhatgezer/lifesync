const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  createOrUpdateDaily,
  getDaily
} = require('../controllers/daily.controller');

router.post('/', authMiddleware, createOrUpdateDaily);
router.get('/', authMiddleware, getDaily);

module.exports = router;