import { useMemo, useState } from "react";
import api from "../services/api";

function Mood() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    mood_score: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const moodNumber = Number(form.mood_score || 0);

  const moodOptions = [
    { score: 1, icon: "😞", label: "Çok Düşük", desc: "Zor bir gün" },
    { score: 2, icon: "😐", label: "Düşük", desc: "Biraz yorgun" },
    { score: 3, icon: "🙂", label: "Normal", desc: "Dengeli" },
    { score: 4, icon: "😊", label: "İyi", desc: "Enerjik" },
    { score: 5, icon: "🤩", label: "Harika", desc: "Çok iyi" },
  ];

  const selectedMood =
    moodOptions.find((item) => item.score === moodNumber) || moodOptions[2];

  const moodScore = useMemo(() => {
    return moodNumber ? moodNumber * 20 : 0;
  }, [moodNumber]);

  const moodStatus =
    moodNumber >= 4
      ? "Pozitif"
      : moodNumber === 3
      ? "Dengeli"
      : moodNumber > 0
      ? "Destek Gerekebilir"
      : "Bekleniyor";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const selectMood = (score) => {
    setForm({
      ...form,
      mood_score: String(score),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        date: form.date,
        mood_score:
          form.mood_score === "" ? undefined : Number(form.mood_score),
      };

      const response = await api.post("/daily", payload);

      setMessage(response.data.message || "Ruh hali verisi kaydedildi.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mood-page">
      <section className="mood-hero">
        <div>
          <span className="hero-pill">Ruh hali merkezi</span>
          <h1>Bugünkü ruh halini kaydet 😊</h1>
          <p>
            Günlük ruh hali skorunu gir. Sistem zamanla hareket, uyku ve
            beslenme verileriyle birlikte zihinsel denge durumunu yorumlayabilir.
          </p>
        </div>

        <div className="mood-preview-card">
          <div className="mood-preview-icon">{selectedMood.icon}</div>
          <span>Seçili ruh hali</span>
          <strong>{selectedMood.label}</strong>
          <p>{selectedMood.desc}</p>
        </div>
      </section>

      <section className="mood-score-row">
        <div className="mood-score-card">
          <div>
            <span className="summary-mini-label">Ruh hali ön skoru</span>
            <h2>{moodScore}/100</h2>
            <p>
              Bu skor 1-5 arasındaki ruh hali değerinden hesaplanır. Düzenli
              giriş yaptıkça haftalık analizlerde daha anlamlı sonuç verir.
            </p>
          </div>

          <div className="mood-meter">
            <strong>{moodStatus}</strong>
            <div className="mood-score-bar">
              <span style={{ width: `${moodScore}%` }}></span>
            </div>
          </div>
        </div>

        <div className="mood-tip-card">
          <span>💡</span>
          <div>
            <strong>Mini öneri</strong>
            <p>
              Ruh halin düşükse uyku, hareket ve beslenme verileriyle birlikte
              bakmak daha doğru yorum sağlar.
            </p>
          </div>
        </div>
      </section>

      <section className="mood-workspace">
        <form className="mood-form-panel" onSubmit={handleSubmit}>
          <div className="panel-head">
            <div>
              <span className="summary-mini-label">Ruh hali girişi</span>
              <h2>Mental Denge Verisi</h2>
            </div>
            <strong>{form.date}</strong>
          </div>

          <div className="mood-option-grid">
            {moodOptions.map((item) => (
              <button
                type="button"
                key={item.score}
                className={
                  moodNumber === item.score
                    ? "mood-option-card selected-mood"
                    : "mood-option-card"
                }
                onClick={() => selectMood(item.score)}
              >
                <span>{item.icon}</span>
                <strong>{item.score}</strong>
                <small>{item.label}</small>
              </button>
            ))}
          </div>

          <div className="mood-input-grid">
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
              <label>Ruh Hali Skoru</label>
              <input
                type="number"
                min="1"
                max="5"
                name="mood_score"
                value={form.mood_score}
                onChange={handleChange}
                placeholder="1 = çok kötü, 5 = çok iyi"
              />
            </div>
          </div>

          <button className="mood-save-btn" type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Ruh Halini Kaydet"}
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

        <aside className="mood-side-panel">
          <div className="mood-side-card">
            <span>🧠</span>
            <strong>Mental Denge</strong>
            <p>Ruh hali verisi, uyku ve hareketle birlikte daha anlamlı hale gelir.</p>
          </div>

          <div className="mood-side-card">
            <span>🌱</span>
            <strong>Küçük Alışkanlık</strong>
            <p>Kısa yürüyüş, düzenli uyku ve sağlıklı öğünler ruh halini destekleyebilir.</p>
          </div>

          <div className="mood-side-card warning-card">
            <span>⚠️</span>
            <strong>Düşük Skor</strong>
            <p>Düşük skorlar sık tekrar ederse sistem haftalık önerilerde bunu işaretler.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Mood;