const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  getFoods,
  getProteinRecommendations,
} = require("../controllers/foods.controller");

router.get("/", authMiddleware, getFoods);
router.get("/protein-recommendations", authMiddleware, getProteinRecommendations);

module.exports = router;