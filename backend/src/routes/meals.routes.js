const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  createMeal,
  getMealsByDate,
  deleteMeal
} = require('../controllers/meals.controller');

router.post('/', authMiddleware, createMeal);
router.get('/', authMiddleware, getMealsByDate);
router.delete('/:id', authMiddleware, deleteMeal);

module.exports = router;