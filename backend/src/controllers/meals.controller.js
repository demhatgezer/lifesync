const prisma = require("../config/prisma");

const normalizeTags = (tags) => {
  if (!tags) return null;

  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean).join(",");
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .join(",");
  }

  return null;
};

const createMeal = async (req, res) => {
  try {
    const {
      date,
      meal_type,
      description,
      calories,
      protein,
      carbs,
      fat,
      tags,
    } = req.body;

    const userId = req.user.userId;

    if (!date || !meal_type || !description) {
      return res.status(400).json({
        message: "Tarih, öğün tipi ve açıklama gerekli.",
      });
    }

    const newMeal = await prisma.meal.create({
      data: {
        user_id: userId,
        date: new Date(date),
        meal_type,
        description,
        calories: Number(calories || 0),
        protein: protein === "" || protein == null ? null : Number(protein),
        carbs: carbs === "" || carbs == null ? null : Number(carbs),
        fat: fat === "" || fat == null ? null : Number(fat),
        tags: normalizeTags(tags),
      },
    });

    return res.status(201).json({
      message: "Yemek kaydı oluşturuldu.",
      data: newMeal,
    });
  } catch (error) {
    console.error("Create meal error:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};

const getMealsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.userId;

    if (!date) {
      return res.status(400).json({ message: "Tarih gerekli." });
    }

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
      orderBy: {
        created_at: "asc",
      },
    });

    return res.status(200).json(meals);
  } catch (error) {
    console.error("Get meals error:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};

const deleteMeal = async (req, res) => {
  try {
    const mealId = parseInt(req.params.id);
    const userId = req.user.userId;

    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        user_id: userId,
      },
    });

    if (!meal) {
      return res.status(404).json({ message: "Yemek kaydı bulunamadı." });
    }

    await prisma.meal.delete({
      where: { id: mealId },
    });

    return res.status(200).json({ message: "Yemek kaydı silindi." });
  } catch (error) {
    console.error("Delete meal error:", error);
    return res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
};

module.exports = {
  createMeal,
  getMealsByDate,
  deleteMeal,
};