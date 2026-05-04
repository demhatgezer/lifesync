const prisma = require('../config/prisma');

const getGoals = async (req, res) => {
  try {
    const userId = req.user.userId;

    let goals = await prisma.goal.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!goals) {
      goals = await prisma.goal.create({
        data: {
          user_id: userId,
          step_goal: 10000,
          sleep_goal: 8.0,
          exercise_goal: 60,
          spending_limit: 500.0,
          protein_goal: 100.0,
        },
      });
    }

    return res.status(200).json({
      message: 'Hedefler getirildi.',
      data: goals,
    });
  } catch (error) {
    console.error('Get goals error:', error);
    return res.status(500).json({ message: 'Sunucu hatasi olustu.' });
  }
};

const updateGoals = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      step_goal,
      sleep_goal,
      exercise_goal,
      spending_limit,
      protein_goal,
    } = req.body;

    const goals = await prisma.goal.upsert({
      where: {
        user_id: userId,
      },
      update: {
        step_goal: Number(step_goal),
        sleep_goal: Number(sleep_goal),
        exercise_goal: Number(exercise_goal),
        spending_limit: Number(spending_limit),
        protein_goal: Number(protein_goal),
      },
      create: {
        user_id: userId,
        step_goal: Number(step_goal),
        sleep_goal: Number(sleep_goal),
        exercise_goal: Number(exercise_goal),
        spending_limit: Number(spending_limit),
        protein_goal: Number(protein_goal),
      },
    });

    return res.status(200).json({
      message: 'Hedefler guncellendi.',
      data: goals,
    });
  } catch (error) {
    console.error('Update goals error:', error);
    return res.status(500).json({ message: 'Sunucu hatasi olustu.' });
  }
};

module.exports = {
  getGoals,
  updateGoals,
};