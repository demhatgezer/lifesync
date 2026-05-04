import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Summary() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [dailyData, setDailyData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [report, setReport] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [goals, setGoals] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const getWeekRange = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
    };
  };

  const weekRange = useMemo(() => getWeekRange(selectedDate), [selectedDate]);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      setError("");

      const dailyPromise = api
        .get(`/daily?date=${selectedDate}`)
        .then((res) => res.data)
        .catch(() => null);

      const mealsPromise = api
        .get(`/meals?date=${selectedDate}`)
        .then((res) => res.data)
        .catch(() => []);

      const expensesPromise = api
        .get(`/expenses?date=${selectedDate}`)
        .then((res) => res.data)
        .catch(() => []);

      const weeklyReportPromise = api
        .get(`/reports/weekly?start=${weekRange.start}&end=${weekRange.end}`)
        .then((res) => res.data)
        .catch(() => null);

      const aiRecommendationPromise = api
        .get(`/ai/recommendation?start=${weekRange.start}&end=${weekRange.end}`)
        .then((res) => res.data)
        .catch(() => null);
      const goalsPromise = api
  .get("/goals")
  .then((res) => res.data)
  .catch(() => null);

      const [dailyRes, mealsRes, expensesRes, reportRes, aiRes, goalsRes] =
  await Promise.all([
    dailyPromise,
    mealsPromise,
    expensesPromise,
    weeklyReportPromise,
    aiRecommendationPromise,
    goalsPromise,
  ]);

      setDailyData(dailyRes);
      setMeals(Array.isArray(mealsRes) ? mealsRes : []);
      setExpenses(Array.isArray(expensesRes) ? expensesRes : []);
      setReport(reportRes);
      setAiData(aiRes);
      setGoals(goalsRes?.data || null);
    } catch {
      setError("Veriler alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, [selectedDate]);

  const totalDailyExpense = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const dailyScore = useMemo(() => {
  let score = 0;

  const stepGoal = Number(goals?.step_goal || 10000);
  const exerciseGoal = Number(goals?.exercise_goal || 60);
  const sleepGoal = Number(goals?.sleep_goal || 8);

  const steps = Number(dailyData?.steps || 0);
  const exercise = Number(dailyData?.exercise_minutes || 0);
  const sleep = Number(dailyData?.sleep_hours || 0);
  const mood = Number(dailyData?.mood_score || 0);

  if (steps >= stepGoal) score += 25;
  else score += Math.round((steps / stepGoal) * 25);

  if (exercise >= exerciseGoal) score += 25;
  else score += Math.round((exercise / exerciseGoal) * 25);

  if (sleep >= sleepGoal) score += 25;
  else score += Math.round((sleep / sleepGoal) * 25);

  if (mood >= 3) score += 25;
  else score += Math.round((mood / 5) * 25);

  return Math.max(0, Math.min(100, score));
}, [dailyData, goals]);

  const scoreStatus =
  dailyScore >= 75 ? "Harika" : dailyScore >= 50 ? "Dengeli" : "Geliştirilebilir";

const scoreColor =
  dailyScore < 40
    ? "#ef4444"
    : dailyScore < 70
    ? "#f59e0b"
    : "#22c55e";
    

  const weekCards = [
    {
      icon: "👣",
      label: "Toplam Adım",
      value: report?.daily_summary?.total_steps ?? 0,
      detail: "Bu haftaki hareket",
    },
    {
      icon: "💪",
      label: "Egzersiz",
      value: `${report?.daily_summary?.total_exercise_minutes ?? 0} dk`,
      detail: "Toplam aktif süre",
    },
    {
      icon: "🌙",
      label: "Ortalama Uyku",
      value: `${report?.daily_summary?.average_sleep_hours ?? 0} sa`,
      detail: "Haftalık uyku",
    },
    {
      icon: "💳",
      label: "Toplam Harcama",
      value: `${report?.expenses_summary?.total_expenses ?? 0} TL`,
      detail: "Haftalık finans",
    },
  ];

  const mealTypeText = {
    breakfast: "Kahvaltı",
    lunch: "Öğle",
    dinner: "Akşam",
    snack: "Atıştırmalık",
  };

  return (
    <div className="summary-page">
      <section className="summary-hero">
        <div>
          <span className="hero-pill">Yaşam özeti</span>
          <h1>Selam {user?.name || "Kankam"} 👋</h1>
          <p>
            Seçtiğin güne ait hareket, uyku, beslenme, ruh hali ve harcama
            verilerini tek panelde gör.
          </p>
        </div>

        <div className="summary-date-card">
          <span>Analiz tarihi</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <small>
            Hafta: {weekRange.start} / {weekRange.end}
          </small>
        </div>
      </section>

      {error && <div className="message-error">{error}</div>}

      <section className="summary-score-panel">
        <div
  className="score-circle"
  style={{
    "--score-angle": `${(dailyScore / 100) * 360}deg`,
    "--score-color": scoreColor,
  }}
>
          <strong>{dailyScore}</strong>
          <span>/100</span>
        </div>

        <div>
          <span className="summary-mini-label">Günlük yaşam skoru</span>
          <h2>{scoreStatus}</h2>
          <p>
            Bu skor artık kendi belirlediğin adım, egzersiz ve uyku hedeflerine göre
            kişiselleştirilmiş olarak hesaplanır.
          </p>
        </div>

        <button onClick={fetchSummaryData} disabled={loading}>
          {loading ? "Yenileniyor..." : "Verileri Yenile"}
        </button>
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">👣</div>
          <span>Adım</span>
          <strong>{dailyData?.steps ?? 0}</strong>
          <p>Hedef: {goals?.step_goal || 10000} adım</p>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💪</div>
          <span>Egzersiz</span>
          <strong>{dailyData?.exercise_minutes ?? 0} dk</strong>
          <p>Hedef: {goals?.exercise_goal || 60} dk</p>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🌙</div>
          <span>Uyku</span>
          <strong>{dailyData?.sleep_hours ?? 0} sa</strong>
          <p>Hedef: {goals?.sleep_goal || 8} saat</p>
        </div>

        <div className="summary-card">
          <div className="summary-icon">😊</div>
          <span>Ruh Hali</span>
          <strong>{dailyData?.mood_score ?? 0}</strong>
          <p>1-5 arası skor</p>
        </div>
      </section>

      <section className="summary-two-column">
        <div className="summary-panel">
          <div className="panel-head">
            <div>
              <span className="summary-mini-label">Beslenme</span>
              <h2>Bugünkü Öğünler</h2>
            </div>
            <strong>{meals.length} kayıt</strong>
          </div>

          {meals.length === 0 ? (
            <div className="empty-box">Bu tarihe ait öğün kaydı yok.</div>
          ) : (
            <div className="timeline-list">
              {meals.map((meal) => {
                const tags = normalizeTags(meal.tags);

                return (
                  <div className="timeline-item" key={meal.id}>
                    <div className="timeline-dot">🥗</div>
                    <div>
                      <strong>{mealTypeText[meal.meal_type] || "Öğün"}</strong>
                      <p>{meal.description}</p>
                      <div className="summary-macro-row">
  <span>{Number(meal.calories || 0)} kcal</span>
  <span>{Number(meal.protein || 0).toFixed(1)}g protein</span>
  <span>{Number(meal.carbs || 0).toFixed(1)}g karbonhidrat</span>
  <span>{Number(meal.fat || 0).toFixed(1)}g yağ</span>
</div>

                      {tags.length > 0 && (
  <div className="summary-tag-row">
    {tags.map((tag, index) => (
      <span className="badge" key={index}>
        {tag}
      </span>
    ))}
  </div>
)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="summary-panel">
          <div className="panel-head">
            <div>
              <span className="summary-mini-label">Finans</span>
              <h2>Bugünkü Harcamalar</h2>
            </div>
            <strong>{totalDailyExpense.toFixed(2)} TL</strong>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-box">Bu tarihe ait harcama kaydı yok.</div>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <div className="expense-row" key={expense.id}>
                  <div>
                    <strong>{expense.title}</strong>
                    <p>{expense.category || "Kategori yok"}</p>
                  </div>
                  <span>{Number(expense.amount || 0).toFixed(2)} TL</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {report && (
        <section className="weekly-panel">
          <div className="panel-head">
            <div>
              <span className="summary-mini-label">Haftalık performans</span>
              <h2>Bu Haftanın Özeti</h2>
            </div>
            <strong>{report.meals_summary?.total_meals ?? 0} öğün</strong>
          </div>

          <div className="weekly-grid">
            {weekCards.map((card) => (
              <div className="weekly-card" key={card.label}>
                <div>{card.icon}</div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {aiData && (
  <section className="ai-advice-panel">
    <div className="panel-head">
      <div>
        <span className="hero-pill">AI önerileri</span>
        <h2>Kişisel yaşam koçu önerileri</h2>
      </div>
      <strong>{aiData.recommendations?.length || 0} öneri</strong>
    </div>

    {aiData.progress && (
      <div className="ai-progress-grid">
        <div className="ai-progress-card">
          <span>👣 Adım</span>
          <strong>{aiData.progress.step_percent || 0}%</strong>
        </div>

        <div className="ai-progress-card">
          <span>💪 Egzersiz</span>
          <strong>{aiData.progress.exercise_percent || 0}%</strong>
        </div>

        <div className="ai-progress-card">
          <span>🌙 Uyku</span>
          <strong>{aiData.progress.sleep_percent || 0}%</strong>
        </div>

        <div className="ai-progress-card">
          <span>🥩 Protein</span>
          <strong>{aiData.progress.protein_percent || 0}%</strong>
        </div>

        <div className="ai-progress-card">
          <span>💳 Harcama</span>
          <strong>{aiData.progress.spending_percent || 0}%</strong>
        </div>
      </div>
    )}

    <div className="ai-advice-list">
      {aiData.recommendations?.map((item, index) => (
        <div className="ai-advice-card" key={index}>
          <div className="ai-advice-icon">✨</div>
          <p>{item}</p>
        </div>
      ))}
    </div>
  </section>
)}
    </div>
  );
}

export default Summary;