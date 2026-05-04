const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const { getWeeklyReport } = require('../controllers/reports.controller');

router.get('/weekly', authMiddleware, getWeeklyReport);

module.exports = router;