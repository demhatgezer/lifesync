const prisma = require('../config/prisma');

const createExpense = async (req, res) => {
  try {
    const { date, title, category, amount, note } = req.body;
    const userId = req.user.userId;

    if (!date || !title || !amount) {
      return res.status(400).json({ message: 'Tarih, baslik ve tutar gerekli.' });
    }

    const newExpense = await prisma.expense.create({
      data: {
        user_id: userId,
        date: new Date(date),
        title,
        category,
        amount,
        note
      }
    });

    return res.status(201).json({
      message: 'Harcama kaydi olusturuldu.',
      data: newExpense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ message: 'Sunucu hatasi olustu.' });
  }
};

const getExpensesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.userId;

    if (!date) {
      return res.status(400).json({ message: 'Tarih gerekli.' });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        user_id: userId,
        date: new Date(date)
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ message: 'Sunucu hatasi olustu.' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);
    const userId = req.user.userId;

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        user_id: userId
      }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Harcama kaydi bulunamadi.' });
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    });

    return res.status(200).json({ message: 'Harcama kaydi silindi.' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ message: 'Sunucu hatasi olustu.' });
  }
};

module.exports = {
  createExpense,
  getExpensesByDate,
  deleteExpense
};