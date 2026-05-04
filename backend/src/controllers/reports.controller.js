const prisma = require('../config/prisma');

const getWeeklyReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    const userId = req.user.userId;

    if (!start || !end) {
      return res.status(400).json({ message: 'Baslangic ve bitis tarihi gerekli.' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const dailyData = await prisma.dailySummary.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const mealsData = await prisma.meal.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const expensesData = await prisma.expense.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalSteps = dailyData.reduce((sum, item) => sum + (item.steps || 0), 0);
    const totalExercise = dailyData.reduce((sum, item) => sum + (item.exercise_minutes || 0), 0);

    const sleepValues = dailyData
      .map(item => item.sleep_hours ? Number(item.sleep_hours) : 0)
      .filter(v => v > 0);

    const moodValues = dailyData
      .map(item => item.mood_score || 0)
      .filter(v => v > 0);

    const avgSteps = dailyData.length ? totalSteps / dailyData.length : 0;
    const avgSleep = sleepValues.length
      ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length
      : 0;
    const avgMood = moodValues.length
      ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
      : 0;

    const mealCounts = {
      breakfast: mealsData.filter(m => m.meal_type === 'breakfast').length,
      lunch: mealsData.filter(m => m.meal_type === 'lunch').length,
      dinner: mealsData.filter(m => m.meal_type === 'dinner').length,
      snack: mealsData.filter(m => m.meal_type === 'snack').length
    };

    const totalExpenses = expensesData.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const expensesByCategory = {};
    expensesData.forEach(expense => {
      const category = expense.category || 'diger';
      expensesByCategory[category] =
        (expensesByCategory[category] || 0) + Number(expense.amount);
    });

    let topCategory = null;
    let topCategoryAmount = 0;

    for (const category in expensesByCategory) {
      if (expensesByCategory[category] > topCategoryAmount) {
        topCategoryAmount = expensesByCategory[category];
        topCategory = category;
      }
    }

    return res.status(200).json({
      period: {
        start,
        end
      },
      daily_summary: {
        total_steps: totalSteps,
        average_steps: Number(avgSteps.toFixed(2)),
        total_exercise_minutes: totalExercise,
        average_sleep_hours: Number(avgSleep.toFixed(2)),
        average_mood_score: Number(avgMood.toFixed(2))
      },
      meals_summary: {
        total_meals: mealsData.length,
        meal_counts: mealCounts
      },
      expenses_summary: {
        total_expenses: Number(totalExpenses.toFixed(2)),
        expenses_by_category: expensesByCategory,
        top_category: topCategory
      }
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    return res.status(500).json({ message: 'Sunucu hatasi olustu.' });
  }
};

module.exports = {
  getWeeklyReport
};