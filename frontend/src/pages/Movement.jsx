import { useMemo, useState } from "react";
import api from "../services/api";

function Movement() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    steps: "",
    exercise_minutes: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const stepsNumber = Number(form.steps || 0);
  const exerciseNumber = Number(form.exercise_minutes || 0);

  const movementScore = useMemo(() => {
    let score = 0;

    if (stepsNumber >= 3000) score += 25;
    if (stepsNumber >= 6000) score += 25;
    if (stepsNumber >= 10000) score += 25;
    if (exerciseNumber >= 20) score += 25;

    return Math.min(score, 100);
  }, [stepsNumber, exerciseNumber]);

  const movementStatus =
    movementScore >= 75
      ? "Harika"
      : movementScore >= 50
      ? "Dengeli"
      : "Biraz Hareket Lazım";

  const quickValues = [
    { label: "Hafif Gün", steps: "3500", exercise_minutes: "10", icon: "🚶" },
    { label: "Dengeli Gün", steps: "6500", exercise_minutes: "25", icon: "🏃" },
    { label: "Aktif Gün", steps: "10000", exercise_minutes: "40", icon: "🔥" },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const applyQuickValue = (item) => {
    setForm({
      ...form,
      steps: item.steps,
      exercise_minutes: item.exercise_minutes,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        date: form.date,
        steps: form.steps === "" ? undefined : Number(form.steps),
        exercise_minutes:
          form.exercise_minutes === "" ? undefined : Number(form.exercise_minutes),
      };

      const response = await api.post("/daily", payload);

      setMessage(response.data.message || "Hareket verisi kaydedildi.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movement-page">
      <section className="movement-hero">
        <div>
          <span className="hero-pill">Hareket merkezi</span>
          <h1>Bugünkü hareketini kaydet 🏃</h1>
          <p>
            Günlük adım sayını ve egzersiz süreni gir. Sistem hareket seviyeni
            analiz ederek sana günlük denge skoru çıkarabilir.
          </p>
        </div>

        <div className="movement-preview-card">
          <div className="movement-preview-icon">👣</div>
          <span>Adım sayısı</span>
          <strong>{stepsNumber}</strong>
          <p>{exerciseNumber} dakika egzersiz</p>
        </div>
      </section>

      <section className="movement-score-row">
        <div className="movement-score-card">
          <div>
            <span className="summary-mini-label">Hareket ön skoru</span>
            <h2>{movementScore}/100</h2>
            <p>
              Bu skor adım sayısı ve egzersiz süresine göre ön izleme amaçlı
              hesaplanır. 6000+ adım ve 20+ dakika egzersiz iyi başlangıçtır.
            </p>
          </div>

          <div className="movement-meter">
            <strong>{movementStatus}</strong>
            <div className="movement-score-bar">
              <span style={{ width: `${movementScore}%` }}></span>
            </div>
          </div>
        </div>

        <div className="movement-tip-card">
          <span>💡</span>
          <div>
            <strong>Mini öneri</strong>
            <p>
              Gün içinde kısa yürüyüşler eklemek toplam adımı yükseltir.
              Özellikle 6000 adım altı günlerde sistem uyarı verebilir.
            </p>
          </div>
        </div>
      </section>

      <section className="movement-workspace">
        <form className="movement-form-panel" onSubmit={handleSubmit}>
          <div className="panel-head">
            <div>
              <span className="summary-mini-label">Hareket girişi</span>
              <h2>Hareket Verisi</h2>
            </div>
            <strong>{form.date}</strong>
          </div>

          <div className="quick-movement-grid">
            {quickValues.map((item) => (
              <button
                type="button"
                key={item.label}
                className="quick-movement-card"
                onClick={() => applyQuickValue(item)}
              >
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
                <small>
                  {item.steps} adım · {item.exercise_minutes} dk
                </small>
              </button>
            ))}
          </div>

          <div className="movement-input-grid">
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
              <label>Adım Sayısı</label>
              <input
                type="number"
                name="steps"
                value={form.steps}
                onChange={handleChange}
                placeholder="Örn: 6500"
              />
            </div>

            <div>
              <label>Egzersiz Süresi</label>
              <input
                type="number"
                name="exercise_minutes"
                value={form.exercise_minutes}
                onChange={handleChange}
                placeholder="Örn: 30"
              />
            </div>
          </div>

          <button className="movement-save-btn" type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Hareketi Kaydet"}
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

        <aside className="movement-side-panel">
          <div className="movement-side-card">
            <span>🎯</span>
            <strong>Hedef</strong>
            <p>Günlük 6000+ adım dengeli, 10000+ adım aktif gün sayılabilir.</p>
          </div>

          <div className="movement-side-card">
            <span>🔥</span>
            <strong>Egzersiz</strong>
            <p>20 dakika üstü egzersiz hareket skorunu ciddi şekilde artırır.</p>
          </div>

          <div className="movement-side-card warning-card">
            <span>⚠️</span>
            <strong>Düşük Hareket</strong>
            <p>Adım düşükse sistem haftalık önerilerde daha fazla yürüyüş önerebilir.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Movement;