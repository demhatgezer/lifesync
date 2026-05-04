import { useMemo, useState } from "react";
import api from "../services/api";

function Meals() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
  date: today,
  meal_type: "breakfast",
  description: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  tags: "",
});

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const mealOptions = [
    {
      value: "breakfast",
      label: "Kahvaltı",
      icon: "🍳",
      desc: "Güne başlangıç öğünü",
    },
    {
      value: "lunch",
      label: "Öğle",
      icon: "🍛",
      desc: "Günün ana enerjisi",
    },
    {
      value: "dinner",
      label: "Akşam",
      icon: "🍽️",
      desc: "Günün kapanış öğünü",
    },
    {
      value: "snack",
      label: "Atıştırmalık",
      icon: "🍎",
      desc: "Ara öğün / küçük destek",
    },
  ];

  const quickTags = [
    "protein",
    "sebze",
    "karbonhidrat",
    "meyve",
    "su",
    "aburcubur",
    "tatlı",
    "kahve",
  ];

  const parsedTags = useMemo(() => {
    return form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [form.tags]);

  const nutritionScore = useMemo(() => {
    let score = 40;
    const lowerTags = parsedTags.map((tag) => tag.toLowerCase());

    if (lowerTags.includes("protein")) score += 20;
    if (lowerTags.includes("sebze")) score += 20;
    if (lowerTags.includes("meyve")) score += 10;
    if (lowerTags.includes("su")) score += 10;
    if (lowerTags.includes("aburcubur")) score -= 20;
    if (lowerTags.includes("tatlı")) score -= 10;

    return Math.max(0, Math.min(100, score));
  }, [parsedTags]);

  const selectedMeal =
    mealOptions.find((item) => item.value === form.meal_type) || mealOptions[0];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addQuickTag = (tag) => {
    const currentTags = parsedTags.map((item) => item.toLowerCase());

    if (currentTags.includes(tag.toLowerCase())) return;

    setForm({
      ...form,
      tags: [...parsedTags, tag].join(", "),
    });
  };

  const removeTag = (tagName) => {
    const filteredTags = parsedTags.filter(
      (tag) => tag.toLowerCase() !== tagName.toLowerCase()
    );

    setForm({
      ...form,
      tags: filteredTags.join(", "),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = {
  date: form.date,
  meal_type: form.meal_type,
  description: form.description,
  calories: form.calories,
  protein: form.protein,
  carbs: form.carbs,
  fat: form.fat,
  tags: parsedTags,
};

      const response = await api.post("/meals", payload);

      setMessage(response.data.message || "Öğün kaydı oluşturuldu.");
      setForm({
  date: today,
  meal_type: "breakfast",
  description: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  tags: "",
});
    } catch (error) {
      setMessage(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meals-page">
      <section className="meals-hero">
        <div>
          <span className="hero-pill">Beslenme merkezi</span>
          <h1>Bugünkü öğününü kaydet 🥗</h1>
          <p>
            Ne yediğini, öğün tipini ve besin etiketlerini gir. Sistem daha
            sonra protein, sebze ve abur cubur durumunu analiz edebilsin.
          </p>
        </div>

        <div className="meal-preview-card">
          <div className="meal-preview-icon">{selectedMeal.icon}</div>
          <span>Seçili öğün</span>
          <strong>{selectedMeal.label}</strong>
          <p>{selectedMeal.desc}</p>
        </div>
      </section>

      <section className="meal-score-row">
        <div className="meal-score-card">
          <div>
            <span className="summary-mini-label">Beslenme ön skoru</span>
            <h2>{nutritionScore}/100</h2>
            <p>
              Bu skor seçtiğin taglere göre ön izleme amaçlı hesaplanır. Protein
              ve sebze skoru yükseltir; abur cubur ve tatlı düşürür.
            </p>
          </div>

          <div className="meal-score-bar">
            <span style={{ width: `${nutritionScore}%` }}></span>
          </div>
        </div>

        <div className="meal-tip-card">
          <span>💡</span>
          <div>
            <strong>Mini öneri</strong>
            <p>
              Tag olarak <b>protein</b>, <b>sebze</b>, <b>karbonhidrat</b> gibi
              kelimeler girersen AI tarafı daha iyi yorum yapar.
            </p>
          </div>
        </div>
      </section>

      <section className="meal-workspace">
        <form className="meal-form-panel" onSubmit={handleSubmit}>
          <div className="panel-head">
            <div>
              <span className="summary-mini-label">Öğün girişi</span>
              <h2>Beslenme Verisi</h2>
            </div>
            <strong>{form.date}</strong>
          </div>

          <div className="meal-type-grid">
            {mealOptions.map((item) => (
              <button
                type="button"
                key={item.value}
                className={
                  form.meal_type === item.value
                    ? "meal-type-card selected-meal"
                    : "meal-type-card"
                }
                onClick={() => setForm({ ...form, meal_type: item.value })}
              >
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>

          <div className="meal-input-grid">
            <div>
              <label>Tarih</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Öğün Tipi</label>
              <select
                name="meal_type"
                value={form.meal_type}
                onChange={handleChange}
              >
                {mealOptions.map((item) => (
                  <option value={item.value} key={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="full-input">
              <label>Açıklama</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Örn: Tavuk, pilav, salata yedim"
                rows="4"
              />
            </div>
            <div>
  <label>Kalori</label>
  <input
    type="number"
    name="calories"
    value={form.calories}
    onChange={handleChange}
    placeholder="Örn: 650"
    min="0"
  />
</div>

<div>
  <label>Protein (g)</label>
  <input
    type="number"
    name="protein"
    value={form.protein}
    onChange={handleChange}
    placeholder="Örn: 35"
    min="0"
    step="0.1"
  />
</div>

<div>
  <label>Karbonhidrat (g)</label>
  <input
    type="number"
    name="carbs"
    value={form.carbs}
    onChange={handleChange}
    placeholder="Örn: 70"
    min="0"
    step="0.1"
  />
</div>

<div>
  <label>Yağ (g)</label>
  <input
    type="number"
    name="fat"
    value={form.fat}
    onChange={handleChange}
    placeholder="Örn: 18"
    min="0"
    step="0.1"
  />
</div>

            <div className="full-input">
              <label>Tagler</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="protein, sebze, karbonhidrat"
              />
            </div>
          </div>

          <div className="quick-tag-area">
            <span>Hızlı tag ekle:</span>
            <div>
              {quickTags.map((tag) => (
                <button type="button" key={tag} onClick={() => addQuickTag(tag)}>
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {parsedTags.length > 0 && (
            <div className="selected-tags">
              {parsedTags.map((tag) => (
                <button type="button" key={tag} onClick={() => removeTag(tag)}>
                  {tag} ✕
                </button>
              ))}
            </div>
          )}

          <button className="meal-save-btn" type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Öğünü Kaydet"}
          </button>

          {message && (
            <div
              className={
                message.toLowerCase().includes("hata") ||
                message.toLowerCase().includes("oluştu") ||
                message.toLowerCase().includes("kaydedilemedi")
                  ? "message-error"
                  : "message-success"
              }
            >
              {message}
            </div>
          )}
        </form>

        <aside className="meal-side-panel">
          <div className="side-mini-card">
            <span>🥩</span>
            <strong>Protein</strong>
            <p>Yumurta, tavuk, yoğurt, balık gibi kaynakları işaretle.</p>
          </div>

          <div className="side-mini-card">
            <span>🥦</span>
            <strong>Sebze</strong>
            <p>Salata, brokoli, domates gibi sebzeleri tag olarak ekle.</p>
          </div>

          <div className="side-mini-card warning-card">
            <span>🍟</span>
            <strong>Abur Cubur</strong>
            <p>Abur cubur tagi girilirse sistem seni daha sonra uyarabilir.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Meals;