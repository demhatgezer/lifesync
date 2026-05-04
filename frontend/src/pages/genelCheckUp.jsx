import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  const [movementForm, setMovementForm] = useState({
    steps: "",
    exercise_minutes: "",
  });

  const [sleepForm, setSleepForm] = useState({
    sleep_hours: "",
  });

  const [moodForm, setMoodForm] = useState({
    mood_score: "",
  });

  const [mealForm, setMealForm] = useState({
    meal_type: "breakfast",
    description: "",
    tags: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "",
    amount: "",
    note: "",
  });

  const [message, setMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState(null);

  const nutritionCounts = useMemo(() => {
    const tagsArray = mealForm.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    return {
      protein_count: tagsArray.filter((tag) =>
        ["protein", "tavuk", "et", "yumurta", "yoğurt", "peynir", "balık"].includes(tag)
      ).length,
      vegetable_count: tagsArray.filter((tag) =>
        ["sebze", "salata", "domates", "salatalık", "brokoli", "ıspanak"].includes(tag)
      ).length,
      carb_count: tagsArray.filter((tag) =>
        ["karbonhidrat", "pilav", "makarna", "ekmek", "patates", "yulaf"].includes(tag)
      ).length,
      junk_count: tagsArray.filter((tag) =>
        ["aburcubur", "junk", "cips", "kola", "hamburger", "pizza", "tatlı"].includes(tag)
      ).length,
      meal_count: mealForm.description.trim() !== "" || tagsArray.length > 0 ? 1 : 0,
    };
  }, [mealForm]);

  useEffect(() => {
  const fetchGoals = async () => {
    try {
      const response = await api.get("/goals");
      setGoals(response.data.data);
    } catch (error) {
      console.error("Goals alınamadı:", error);
    }
  };

  fetchGoals();
}, []);
  const quickStats = [
    {
      icon: "👣",
      label: "Adım",
      value: movementForm.steps || "0",
      helper: "Günlük hareket",
    },
    {
      icon: "💪",
      label: "Egzersiz",
      value: `${movementForm.exercise_minutes || 0} dk`,
      helper: "Aktif süre",
    },
    {
      icon: "🌙",
      label: "Uyku",
      value: `${sleepForm.sleep_hours || 0} sa`,
      helper: "Dinlenme",
    },
    {
      icon: "😊",
      label: "Ruh Hali",
      value: moodForm.mood_score || "0",
      helper: "1-5 arası",
    },
  ];
  const calculatePercent = (current, target) => {
  const currentValue = Number(current || 0);
  const targetValue = Number(target || 1);

  if (targetValue <= 0) return 0;

  return Math.min(100, Math.round((currentValue / targetValue) * 100));
};

const totalExpenseInput = Number(expenseForm.amount || 0);

const goalProgressCards = [
  {
    icon: "👣",
    title: "Adım Hedefi",
    current: Number(movementForm.steps || 0),
    target: Number(goals?.step_goal || 10000),
    unit: "adım",
    percent: calculatePercent(movementForm.steps, goals?.step_goal || 10000),
  },
  {
    icon: "💪",
    title: "Egzersiz Hedefi",
    current: Number(movementForm.exercise_minutes || 0),
    target: Number(goals?.exercise_goal || 60),
    unit: "dk",
    percent: calculatePercent(
      movementForm.exercise_minutes,
      goals?.exercise_goal || 60
    ),
  },
  {
    icon: "🌙",
    title: "Uyku Hedefi",
    current: Number(sleepForm.sleep_hours || 0),
    target: Number(goals?.sleep_goal || 8),
    unit: "saat",
    percent: calculatePercent(sleepForm.sleep_hours, goals?.sleep_goal || 8),
  },
  {
    icon: "💳",
    title: "Harcama Limiti",
    current: totalExpenseInput,
    target: Number(goals?.spending_limit || 500),
    unit: "TL",
    percent: calculatePercent(totalExpenseInput, goals?.spending_limit || 500),
  },
];
const formatAiStatus = (status) => {
  const statusMap = {
    unhealthy_pattern: "Dengesiz Gün",
    balanced_day: "Dengeli Gün",
    productive_day: "Çok İyi Gidiyorsun",
    needs_attention: "Dikkat Gerekiyor",
    good_pattern: "İyi Gidiyorsun",

    low: "Düşük",
    normal: "Normal",
    good: "İyi",
    poor: "Zayıf",
    high: "Yüksek",

    sleep_low: "Uyku Düşük",
    activity_low: "Hareket Düşük",
    protein_low: "Protein Düşük",
    mood_low: "Ruh Hali Düşük",
  };

  return statusMap[status] || status;
};

  const handleSaveAll = async () => {
    setMessage("");
    setAiMessage("");
    setSaving(true);

    try {
      await api.post("/daily", {
        date: selectedDate,
        steps: movementForm.steps === "" ? undefined : Number(movementForm.steps),
        exercise_minutes:
          movementForm.exercise_minutes === ""
            ? undefined
            : Number(movementForm.exercise_minutes),
        sleep_hours:
          sleepForm.sleep_hours === "" ? undefined : Number(sleepForm.sleep_hours),
        mood_score:
          moodForm.mood_score === "" ? undefined : Number(moodForm.mood_score),
      });

      if (mealForm.description.trim() !== "" || mealForm.tags.trim() !== "") {
        await api.post("/meals", {
          date: selectedDate,
          meal_type: mealForm.meal_type,
          description: mealForm.description || "Öğün kaydı",
          tags: mealForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        });
      }

      if (expenseForm.title.trim() !== "" && expenseForm.amount !== "") {
        await api.post("/expenses", {
          date: selectedDate,
          title: expenseForm.title,
          category: expenseForm.category || "diger",
          amount: Number(expenseForm.amount),
          note: expenseForm.note,
        });
      }

      setMessage("Bugünkü veriler başarıyla kaydedildi.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setAiMessage("");
    setAiResult(null);
    setLoading(true);

    try {
      const payload = {
        mood_score: Number(moodForm.mood_score || 0),
        sleep_hours: Number(sleepForm.sleep_hours || 0),
        steps: Number(movementForm.steps || 0),
        exercise_minutes: Number(movementForm.exercise_minutes || 0),
        ...nutritionCounts,
      };

      const response = await api.post("/ai/analyze", payload);
      setAiResult(response.data);
    } catch (error) {
      setAiMessage("AI analizi sırasında hata oluştu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="hero-pill">Bugünkü kontrol merkezi</span>
          <h1>Selam {user?.name || "Kankam"} 👋</h1>
          <p>
            Hareketini, uykunu, ruh halini, beslenmeni ve harcamalarını tek
            yerden gir. Sonra tek butonla bugünü kaydet.
          </p>
        </div>

        <div className="date-control">
          <span>Kontrol tarihi</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </section>

      <section className="mini-stat-grid">
        {quickStats.map((item) => (
          <div className="mini-stat-card" key={item.label}>
            <div className="mini-icon">{item.icon}</div>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.helper}</p>
            </div>
          </div>
        ))}
      </section>
      <section className="goal-progress-panel">
  <div className="panel-head">
    <div>
      <span className="summary-mini-label">Hedef ilerlemen</span>
      <h2>Bugünkü hedef durumu 🎯</h2>
    </div>
  </div>

  <div className="goal-progress-grid">
    {goalProgressCards.map((item) => (
      <div className="goal-progress-card" key={item.title}>
        <div className="goal-progress-top">
          <span className="goal-progress-icon">{item.icon}</span>
          <div>
            <h3>{item.title}</h3>
            <p>
              {item.current} / {item.target} {item.unit}
            </p>
          </div>
          <strong>{item.percent}%</strong>
        </div>

        <div className="goal-progress-bar">
          <span style={{ width: `${item.percent}%` }}></span>
        </div>
      </div>
    ))}
  </div>
</section>

      

      

      

      <section className="dashboard-form-grid">
        <div className="rich-form-card movement-card">
          <div className="form-head">
            <div className="form-icon">🏃</div>
            <div>
              <h3>Hareket</h3>
              <p>Adım ve egzersiz süreni gir.</p>
            </div>
          </div>

          <input
            type="number"
            placeholder="Adım sayısı"
            value={movementForm.steps}
            onChange={(e) =>
              setMovementForm({ ...movementForm, steps: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Egzersiz süresi (dk)"
            value={movementForm.exercise_minutes}
            onChange={(e) =>
              setMovementForm({
                ...movementForm,
                exercise_minutes: e.target.value,
              })
            }
          />
        </div>

        <div className="rich-form-card sleep-card">
          <div className="form-head">
            <div className="form-icon">🌙</div>
            <div>
              <h3>Uyku</h3>
              <p>Kaç saat uyuduğunu gir.</p>
            </div>
          </div>

          <input
            type="number"
            step="0.1"
            placeholder="Uyku süresi"
            value={sleepForm.sleep_hours}
            onChange={(e) => setSleepForm({ sleep_hours: e.target.value })}
          />
        </div>

        <div className="rich-form-card mood-card">
          <div className="form-head">
            <div className="form-icon">😊</div>
            <div>
              <h3>Ruh Hali</h3>
              <p>Bugünkü modunu 1-5 arası puanla.</p>
            </div>
          </div>

          <input
            type="number"
            min="1"
            max="5"
            placeholder="Ruh hali skoru"
            value={moodForm.mood_score}
            onChange={(e) => setMoodForm({ mood_score: e.target.value })}
          />
        </div>

        <div className="rich-form-card nutrition-card">
          <div className="form-head">
            <div className="form-icon">🥗</div>
            <div>
              <h3>Beslenme</h3>
              <p>Öğününü ve etiketlerini ekle.</p>
            </div>
          </div>

          <select
            value={mealForm.meal_type}
            onChange={(e) =>
              setMealForm({ ...mealForm, meal_type: e.target.value })
            }
          >
            <option value="breakfast">Kahvaltı</option>
            <option value="lunch">Öğle</option>
            <option value="dinner">Akşam</option>
            <option value="snack">Atıştırmalık</option>
          </select>

          <input
            type="text"
            placeholder="Örn: tavuk salata yedim"
            value={mealForm.description}
            onChange={(e) =>
              setMealForm({ ...mealForm, description: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Tagler: protein, sebze, karbonhidrat"
            value={mealForm.tags}
            onChange={(e) => setMealForm({ ...mealForm, tags: e.target.value })}
          />
        </div>

        <div className="rich-form-card expense-card">
          <div className="form-head">
            <div className="form-icon">💳</div>
            <div>
              <h3>Finansal</h3>
              <p>Bugünkü harcamalarını ekle.</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Başlık"
            value={expenseForm.title}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, title: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Kategori"
            value={expenseForm.category}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, category: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Tutar"
            value={expenseForm.amount}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, amount: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Not"
            value={expenseForm.note}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, note: e.target.value })
            }
          />
        </div>
      </section>

      <section className="action-banner">
        

        <div className="action-content">
  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
    <button onClick={handleSaveAll} disabled={saving}>
      {saving ? "Kaydediliyor..." : "💾 Bugünü Kaydet"}
    </button>

    <button onClick={handleAnalyze} disabled={loading}>
      {loading ? "Analiz ediliyor..." : "✨ AI Analiz Yap"}
    </button>
  </div>

  {message && (
    <div
      className={
        message.toLowerCase().includes("hata") ||
        message.toLowerCase().includes("oluştu")
          ? "message-error"
          : "message-success"
      }
    >
      {message}
    </div>
  )}
{aiMessage && <div className="message-error">{aiMessage}</div>}
{aiResult && (
        <section className="ai-result-panel">
          <div>
            <span className="hero-pill">AI sonucu</span>
            <h2>Genel durum: {formatAiStatus(aiResult.overall_status)}</h2>
          </div>

          <div className="ai-grid">
            <div>
              <span>Ruh Hali:&nbsp;</span>
              <strong>{formatAiStatus(aiResult.mood_status)}</strong>
            </div>
            <div>
              <span>Uyku:&nbsp;</span>
              <strong>{formatAiStatus(aiResult.sleep_status)}</strong>
            </div>
            <div>
              <span>Hareket:&nbsp;</span>
              <strong>{formatAiStatus(aiResult.activity_status)}</strong>
            </div>
            <div>
              <span>Beslenme:&nbsp;</span>
              <strong>{formatAiStatus(aiResult.nutrition_status)}</strong>
            </div>
          </div>
          {aiResult.goal_progress && (
  <div className="dashboard-ai-progress">
    <div>
      <span>👣 Adım hedefi</span>
      <strong>{aiResult.goal_progress.step_percent || 0}%</strong>
    </div>

    <div>
      <span>🌙 Uyku hedefi</span>
      <strong>{aiResult.goal_progress.sleep_percent || 0}%</strong>
    </div>

    <div>
      <span>💪 Egzersiz hedefi</span>
      <strong>{aiResult.goal_progress.exercise_percent || 0}%</strong>
    </div>

    <div>
      <span>🥩 Protein hedefi</span>
      <strong>{aiResult.goal_progress.protein_percent || 0}%</strong>
    </div>
  </div>
)}

{aiResult.personalized_recommendations?.length > 0 && (
  <div className="dashboard-ai-recommendations">
    <h3>Kişisel öneriler</h3>

    {aiResult.personalized_recommendations.map((item, index) => (
      <div className="dashboard-ai-rec-card" key={index}>
        <span>✨</span>
        <p>{item}</p>
      </div>
    ))}
  </div>
)}
        </section>
      )}

</div>
      </section>
    </div>
  );
}

export default Dashboard;