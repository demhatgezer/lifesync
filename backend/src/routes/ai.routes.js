const express = require('express');
const axios = require('axios');
const prisma = require('../config/prisma');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const { getRecommendation } = require('../controllers/ai.controller');

router.get('/recommendation', authMiddleware, getRecommendation);

router.post('/analyze', authMiddleware, async (req, res) => {
  try {
        const userId = req.user.userId;

    const goals = await prisma.goal.findUnique({
      where: {
        user_id: userId,
      },
    });

    const stepGoal = Number(goals?.step_goal || 10000);
    const sleepGoal = Number(goals?.sleep_goal || 8);
    const exerciseGoal = Number(goals?.exercise_goal || 60);
    const proteinGoal = Number(goals?.protein_goal || 100);
    const {
      mood_score,
      sleep_hours,
      steps,
      exercise_minutes,
      protein_count,
      vegetable_count,
      carb_count,
      junk_count,
      meal_count,
    } = req.body;

    const moodResponse = await axios.post('http://127.0.0.1:8000/predict/mood', {
      mood_score,
    });

    const sleepResponse = await axios.post('http://127.0.0.1:8000/predict/sleep', {
      sleep_hours,
    });

    const activityResponse = await axios.post('http://127.0.0.1:8000/predict/activity', {
      steps,
      exercise_minutes,
    });

    const nutritionResponse = await axios.post('http://127.0.0.1:8000/predict/nutrition', {
      protein_count,
      vegetable_count,
      carb_count,
      junk_count,
      meal_count,
    });

    const mood_status = moodResponse.data.status;
    const sleep_status = sleepResponse.data.status;
    const activity_status = activityResponse.data.status;
    const nutrition_status = nutritionResponse.data.status;
        const estimatedProtein =
      Number(protein_count || 0) * 25;

    const step_percent = Math.min(
      100,
      Math.round((Number(steps || 0) / stepGoal) * 100)
    );

    const sleep_percent = Math.min(
      100,
      Math.round((Number(sleep_hours || 0) / sleepGoal) * 100)
    );

    const exercise_percent = Math.min(
      100,
      Math.round((Number(exercise_minutes || 0) / exerciseGoal) * 100)
    );

    const protein_percent = Math.min(
      100,
      Math.round((estimatedProtein / proteinGoal) * 100)
    );

    const personalized_recommendations = [];

    if (step_percent < 70) {
      personalized_recommendations.push(
        `Adım hedefinin yaklaşık %${step_percent}'indesin. Gün içine kısa yürüyüşler ekleyebilirsin.`
      );
    }

    if (sleep_percent < 85) {
      personalized_recommendations.push(
        `Uyku hedefinin yaklaşık %${sleep_percent}'ine ulaşmışsın. Daha düzenli uyku faydalı olabilir.`
      );
    }

    if (exercise_percent < 70) {
      personalized_recommendations.push(
        `Egzersiz hedefinin yaklaşık %${exercise_percent}'indesin. Hafif bir egzersiz ekleyebilirsin.`
      );
    }

    if (protein_percent < 70) {
      personalized_recommendations.push(
        `Protein hedefinin yaklaşık %${protein_percent}'indesin. Protein ağırlıklı öğün düşünebilirsin.`
      );
    }

    if (personalized_recommendations.length === 0) {
      personalized_recommendations.push(
        "Bugünkü hedeflerin genel olarak dengeli görünüyor."
      );
    }

    const generalResponse = await axios.post('http://127.0.0.1:8000/predict/general', {
      activity_status,
      sleep_status,
      mood_status,
      nutrition_status,
    });

    const overall_status = generalResponse.data.status;

    res.json({
  mood_status,
  sleep_status,
  activity_status,
  nutrition_status,
  overall_status,

  goal_progress: {
    step_percent,
    sleep_percent,
    exercise_percent,
    protein_percent,
  },

  personalized_recommendations,
});
  } catch (error) {
    console.error('AI analyze error:', error.message);
    res.status(500).json({
      message: 'AI analizi sırasında hata oluştu.',
      error: error.message,
    });
  }
});

module.exports = router;