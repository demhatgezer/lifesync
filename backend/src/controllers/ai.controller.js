const prisma = require("../config/prisma");

const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const getRecommendation = async (req, res) => {
  try {
    const { start, end } = req.query;
    const userId = req.user.userId;

    if (!start || !end) {
      return res.status(400).json({
        message: "Baslangic ve bitis tarihi gerekli.",
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const goals = await prisma.goal.findUnique({
      where: {
        user_id: userId,
      },
    });

    const stepGoal = Number(goals?.step_goal || 10000);
    const sleepGoal = Number(goals?.sleep_goal || 8);
    const exerciseGoal = Number(goals?.exercise_goal || 60);
    const spendingLimit = Number(goals?.spending_limit || 500);
    const proteinGoal = Number(goals?.protein_goal || 100);

    const dailyData = await prisma.dailySummary.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const mealsData = await prisma.meal.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const expensesData = await prisma.expense.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const recommendations = [];

    const totalSteps = dailyData.reduce(
      (sum, item) => sum + Number(item.steps || 0),
      0
    );

    const totalExercise = dailyData.reduce(
      (sum, item) => sum + Number(item.exercise_minutes || 0),
      0
    );

    const avgSteps = dailyData.length ? totalSteps / dailyData.length : 0;
    const avgExercise = dailyData.length ? totalExercise / dailyData.length : 0;

    const sleepValues = dailyData
      .map((item) => (item.sleep_hours ? Number(item.sleep_hours) : 0))
      .filter((v) => v > 0);

    const avgSleep = sleepValues.length
      ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length
      : 0;

    const moodValues = dailyData
      .map((item) => item.mood_score || 0)
      .filter((v) => v > 0);

    const avgMood = moodValues.length
      ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
      : 0;

    const totalExpenses = expensesData.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalProtein = mealsData.reduce(
      (sum, meal) => sum + Number(meal.protein || 0),
      0
    );

    const totalCalories = mealsData.reduce(
      (sum, meal) => sum + Number(meal.calories || 0),
      0
    );

    const categoryTotals = {};
    expensesData.forEach((expense) => {
      const category = expense.category || "diger";
      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(expense.amount || 0);
    });

    const allTags = mealsData.flatMap((meal) => normalizeTags(meal.tags));
    const lowerTags = allTags.map((tag) => tag.toLowerCase());

    const stepPercent = stepGoal > 0 ? Math.round((avgSteps / stepGoal) * 100) : 0;
    const exercisePercent =
      exerciseGoal > 0 ? Math.round((avgExercise / exerciseGoal) * 100) : 0;
    const sleepPercent =
      sleepGoal > 0 && avgSleep > 0 ? Math.round((avgSleep / sleepGoal) * 100) : 0;
    const proteinPercent =
      proteinGoal > 0 ? Math.round((totalProtein / proteinGoal) * 100) : 0;
    const spendingPercent =
      spendingLimit > 0 ? Math.round((totalExpenses / spendingLimit) * 100) : 0;

    if (dailyData.length === 0) {
      recommendations.push(
        "Bu tarih aralığında günlük hareket, uyku veya ruh hali verisi az görünüyor. Daha doğru analiz için günlük check-up kaydı ekleyebilirsin."
      );
    }

    if (stepPercent < 60) {
      recommendations.push(
        `Adım hedefinin yaklaşık %${stepPercent}'ine ulaşmışsın. Kısa bir yürüyüş eklemek günlük hareket dengen için iyi olabilir.`
      );
    } else if (stepPercent >= 100) {
      recommendations.push(
        `Adım hedefini yakalamışsın. Hareket tarafında çok iyi gidiyorsun.`
      );
    } else {
      recommendations.push(
        `Adım hedefinin yaklaşık %${stepPercent}'ine ulaşmışsın. Hedefe oldukça yakınsın.`
      );
    }

    if (exercisePercent < 50) {
      recommendations.push(
        `Egzersiz hedefinin yaklaşık %${exercisePercent}'indesin. Bugün kısa bir esneme, yürüyüş veya hafif egzersiz ekleyebilirsin.`
      );
    } else if (exercisePercent >= 100) {
      recommendations.push(
        "Egzersiz hedefini tamamlamış görünüyorsun. Bu aktif rutini korumaya çalış."
      );
    }

    if (avgSleep > 0 && sleepPercent < 85) {
      recommendations.push(
        `Uyku hedefinin yaklaşık %${sleepPercent}'ine ulaşmışsın. Daha düzenli uyku saati belirlemek toparlanmana yardımcı olabilir.`
      );
    } else if (avgSleep > 0 && sleepPercent >= 100) {
      recommendations.push(
        "Uyku hedefin iyi görünüyor. Dinlenme tarafında dengeli ilerliyorsun."
      );
    }

    if (avgMood > 0 && avgMood <= 2.5) {
      recommendations.push(
        "Ruh hali ortalaman düşük görünüyor. Dinlenmeye ve seni rahatlatan aktivitelere zaman ayırman iyi olabilir."
      );
    }

    if (proteinPercent < 70) {
      recommendations.push(
        `Protein hedefinin yaklaşık %${proteinPercent}'indesin. Tavuk, yumurta, yoğurt, ton balığı veya bakliyat gibi protein kaynaklarını artırabilirsin.`
      );
    } else if (proteinPercent >= 100) {
      recommendations.push(
        "Protein hedefini tamamlamış görünüyorsun. Beslenme tarafında güçlü bir gün olmuş."
      );
    }

    const sebzeCount = lowerTags.filter((tag) => tag === "sebze").length;

    if (sebzeCount === 0 && mealsData.length > 0) {
      recommendations.push(
        "Sebze tüketimin düşük görünüyor. Öğünlerine salata veya sebze eklemek dengeyi artırabilir."
      );
    }

    if (totalCalories > 2500) {
      recommendations.push(
        "Kalori toplamın yüksek görünüyor. Akşam öğünlerinde daha hafif seçenekleri tercih edebilirsin."
      );
    }

    if (spendingPercent >= 100) {
      recommendations.push(
        `Harcama limitini aşmışsın. Bugünkü harcaman limitinin yaklaşık %${spendingPercent}'ine denk geliyor.`
      );
    } else if (spendingPercent >= 80) {
      recommendations.push(
        `Harcama limitinin yaklaşık %${spendingPercent}'ine ulaşmışsın. Günün kalanında harcamaları kontrollü tutabilirsin.`
      );
    }

    if (categoryTotals["yemek"] && categoryTotals["yemek"] > spendingLimit * 0.5) {
      recommendations.push(
        "Yemek harcamaların toplam limitin önemli bir kısmını oluşturuyor. Evde hazırlanan öğünler tasarruf sağlayabilir."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Genel durumun dengeli görünüyor. Mevcut rutinini korumaya devam edebilirsin."
      );
    }

    return res.status(200).json({
      period: { start, end },
      goals: {
        step_goal: stepGoal,
        sleep_goal: sleepGoal,
        exercise_goal: exerciseGoal,
        spending_limit: spendingLimit,
        protein_goal: proteinGoal,
      },
      summary: {
        average_steps: Number(avgSteps.toFixed(2)),
        average_exercise: Number(avgExercise.toFixed(2)),
        average_sleep: Number(avgSleep.toFixed(2)),
        average_mood: Number(avgMood.toFixed(2)),
        total_expenses: Number(totalExpenses.toFixed(2)),
        total_protein: Number(totalProtein.toFixed(2)),
        total_calories: Number(totalCalories.toFixed(2)),
      },
      progress: {
        step_percent: stepPercent,
        exercise_percent: exercisePercent,
        sleep_percent: sleepPercent,
        protein_percent: proteinPercent,
        spending_percent: spendingPercent,
      },
      recommendations,
    });
  } catch (error) {
    console.error("AI recommendation error:", error);
    return res.status(500).json({ message: "Sunucu hatasi olustu." });
  }
};

module.exports = {
  getRecommendation,
};