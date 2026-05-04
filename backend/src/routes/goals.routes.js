const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  getGoals,
  updateGoals,
} = require('../controllers/goals.controller');

router.get('/', authMiddleware, getGoals);
router.put('/', authMiddleware, updateGoals);

module.exports = router;