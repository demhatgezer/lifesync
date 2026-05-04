const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  createExpense,
  getExpensesByDate,
  deleteExpense
} = require('../controllers/expenses.controller');

router.post('/', authMiddleware, createExpense);
router.get('/', authMiddleware, getExpensesByDate);
router.delete('/:id', authMiddleware, deleteExpense);

module.exports = router;