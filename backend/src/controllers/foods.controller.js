const prisma = require("../config/prisma");

const defaultFoods = [
  { name: "Tavuk göğsü", category: "Et", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Ton balığı", category: "Balık", calories: 132, protein: 29, carbs: 0, fat: 1 },
  { name: "Yumurta", category: "Kahvaltı", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: "Lor peyniri", category: "Süt ürünü", calories: 90, protein: 18, carbs: 3, fat: 1 },
  { name: "Yoğurt", category: "Süt ürünü", calories: 61, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: "Kırmızı mercimek", category: "Bakliyat", calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: "Nohut", category: "Bakliyat", calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  { name: "Hindi göğsü", category: "Et", calories: 135, protein: 30, carbs: 0, fat: 1 },
  { name: "Somon", category: "Balık", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Süt", category: "Süt ürünü", calories: 60, protein: 3.4, carbs: 5, fat: 3.3 },
  { name: "Yulaf", category: "Tahıl", calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { name: "Fıstık ezmesi", category: "Atıştırmalık", calories: 588, protein: 25, carbs: 20, fat: 50 },
];

const seedFoodsIfEmpty = async () => {
  const count = await prisma.food.count();

  if (count === 0) {
    await prisma.food.createMany({
      data: defaultFoods,
    });
  }
};

const getFoods = async (req, res) => {
  try {
    await seedFoodsIfEmpty();

    const foods = await prisma.food.findMany({
      orderBy: {
        protein: "desc",
      },
    });

    return res.status(200).json({
      message: "Besin listesi getirildi.",
      data: foods,
    });
  } catch (error) {
    console.error("Get foods error:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};

const getProteinRecommendations = async (req, res) => {
  try {
    await seedFoodsIfEmpty();

    const userId = req.user.userId;
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    const meals = await prisma.meal.findMany({
      where: {
        user_id: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalProtein = meals.reduce((sum, meal) => {
      return sum + Number(meal.protein || 0);
    }, 0);

    const goals = await prisma.goal.findUnique({
  where: {
    user_id: userId,
  },
});

const proteinGoal = Number(goals?.protein_goal || 100);
    const missingProtein = Math.max(proteinGoal - totalProtein, 0);

    const recommendedFoods = await prisma.food.findMany({
      orderBy: {
        protein: "desc",
      },
      take: 6,
    });

    let status = "good";
    let message = "Bugün protein hedefin gayet iyi görünüyor.";

    if (missingProtein > 0) {
      status = "low";
      message = `Bugün yaklaşık ${missingProtein.toFixed(
        1
      )}g protein eksiğin var. Protein oranı yüksek besinleri tercih edebilirsin.`;
    }

    return res.status(200).json({
      message,
      data: {
        date,
        protein_goal: proteinGoal,
        total_protein: Number(totalProtein.toFixed(1)),
        missing_protein: Number(missingProtein.toFixed(1)),
        status,
        recommendations: recommendedFoods,
      },
    });
  } catch (error) {
    console.error("Protein recommendation error:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};

module.exports = {
  getFoods,
  getProteinRecommendations,
};