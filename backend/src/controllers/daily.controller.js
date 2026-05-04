const prisma = require('../config/prisma');

const createOrUpdateDaily = async (req, res) => {
  try {
    const { date, steps, exercise_minutes, sleep_hours, mood_score } = req.body;
    const userId = req.user.userId;

    if (!date) {
      return res.status(400).json({ message: 'Tarih gerekli.' });
    }

    const existingDaily = await prisma.dailySummary.findFirst({
      where: {
        user_id: userId,
        date: new Date(date),
      },
    });

    const updateData = {};

    if (steps !== undefined && steps !== null && steps !== '') {
      updateData.steps = Number(steps);
    }

    if (
      exercise_minutes !== undefined &&
      exercise_minutes !== null &&
      exercise_minutes !== ''
    ) {
      updateData.exercise_minutes = Number(exercise_minutes);
    }

    if (sleep_hours !== undefined && sleep_hours !== null && sleep_hours !== '') {
      updateData.sleep_hours = Number(sleep_hours);
    }

    if (mood_score !== undefined && mood_score !== null && mood_score !== '') {
      updateData.mood_score = Number(mood_score);
    }

    if (existingDaily) {
      const updatedDaily = await prisma.dailySummary.update({
        where: { id: existingDaily.id },
        data: updateData,
      });

      return res.status(200).json({
        message: 'Gunluk veri guncellendi.',
        data: updatedDaily,
      });
    }

    const newDaily = await prisma.dailySummary.create({
      data: {
        user_id: userId,
        date: new Date(date),
        steps: updateData.steps ?? 0,
        exercise_minutes: updateData.exercise_minutes ?? 0,
        sleep_hours: updateData.sleep_hours ?? null,
        mood_score: updateData.mood_score ?? null,
      },
    });

    return res.status(201).json({
      message: 'Gunluk veri olusturuldu.',
      data: newDaily,
    });
  } catch (error) {
    console.error('Daily create/update error:', error);
    return res.status(500).json({ message: 'Sunucu hatasi olustu.' });
  }
};

const getDaily = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.userId;

    if (!date) {
      return res.status(400).json({ message: 'Tarih gerekli.' });
    }

    const daily = await prisma.dailySummary.findFirst({
      where: {
        user_id: userId,
        date: new Date(date),
      },
    });

    if (!daily) {
      return res.status(404).json({ message: 'Bu tarihe ait veri bulunamadi.' });
    }

    return res.status(200).json(daily);
  } catch (error) {
    console.error('Daily get error:', error);
    return res.status(500).json({ message: 'Sunucu hatasi olustu.' });
  }
};

module.exports = {
  createOrUpdateDaily,
  getDaily,
};