require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const dailyRoutes = require("./routes/daily.routes");
const mealsRoutes = require("./routes/meals.routes");
const expensesRoutes = require("./routes/expenses.routes");
const reportsRoutes = require("./routes/reports.routes");
const aiRoutes = require("./routes/ai.routes");
const goalsRoutes = require("./routes/goals.routes");
const foodsRoutes = require("./routes/foods.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/daily", dailyRoutes);
app.use("/meals", mealsRoutes);
app.use("/expenses", expensesRoutes);
app.use("/reports", reportsRoutes);
app.use("/ai", aiRoutes);
app.use("/goals", goalsRoutes);
app.use("/foods", foodsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API calisiyor kankam 🚀" });
});

module.exports = app;