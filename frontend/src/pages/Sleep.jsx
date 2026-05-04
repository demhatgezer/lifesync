import { useMemo, useState } from "react";
import api from "../services/api";

function Sleep() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    sleep_hours: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sleepNumber = Number(form.sleep_hours || 0);

  const sleepScore = useMemo(() => {
    if (sleepNumber === 0) return 0;
    if (sleepNumber >= 7 && sleepNumber <= 9) return 100;
    if (sleepNumber >= 6 && sleepNumber < 7) return 80;
    if (sleepNumber > 9 && sleepNumber <= 10) return 80;
    if (sleepNumber >= 5 && sleepNumber < 6) return 60;
    if (sleepNumber > 10) return 55;
    return 35;
  }, [sleepNumber]);

  const sleepStatus =
    sleepScore >= 90
      ? "İdeal"
      : sleepScore >= 75
      ? "Dengeli"
      : sleepScore >= 55
      ? "Geliştirilebilir"
      : "Düşük";

  const quickSleepValues = [
    { label: "Kısa Uyku", hours: "5.5", icon: "😴" },
    { label: "Dengeli Uyku", hours: "7.5", icon: "🌙" },
    { label: "Uzun Uyku", hours: "9.5", icon: "🛌" },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const applyQuickSleep = (item) => {
    setForm({
      ...form,
      sleep_hours: item.hours,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        date: form.date,
        sleep_hours:
          form.sleep_hours === "" ? undefined : Number(form.sleep_hours),
      };

      const response = await api.post("/daily", payload);

      setMessage(response.data.message || "Uyku verisi kaydedildi.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sleep-page">
      <section className="sleep-hero">
        <div>
          <span className="hero-pill">Uyku merkezi</span>
          <h1>Bugünkü uykunu kaydet 🌙</h1>
          <p>
            Uyku süreni takip ederek günlük enerji düzenini daha iyi analiz et.
            Sistem uyku kalıbına göre denge skorunu yorumlayabilir.
          </p>
        </div>

        <div className="sleep-preview-card">
          <div className="sleep-preview-icon">🛌</div>
          <span>Uyku süresi</span>
          <strong>{sleepNumber || 0} saat</strong>
          <p>{sleepStatus}</p>
        </div>
      </section>

      <section className="sleep-score-row">
        <div className="sleep-score-card">
          <div>
            <span className="summary-mini-label">Uyku ön skoru</span>
            <h2>{sleepScore}/100</h2>
            <p>
              7-9 saat arası genelde ideal kabul edilir. Daha düşük veya çok
              yüksek süreler dengeyi etkileyebilir.
            </p>
          </div>

          <div className="sleep-meter">
            <strong>{sleepStatus}</strong>
            <div className="sleep-score-bar">
              <span style={{ width: `${sleepScore}%` }}></span>
            </div>
          </div>
        </div>

        <div className="sleep-tip-card">
          <span>💡</span>
          <div>
            <strong>Mini öneri</strong>
            <p>
              Düzenli uyku saatleri ruh hali ve günlük enerji analizlerinde daha
              iyi sonuç verir.
            </p>
          </div>
        </div>
      </section>

      <section className="sleep-workspace">
        <form className="sleep-form-panel" onSubmit={handleSubmit}>
          <div className="panel-head">
            <div>
              <span className="summary-mini-label">Uyku girişi</span>
              <h2>Uyku Verisi</h2>
            </div>
            <strong>{form.date}</strong>
          </div>

          <div className="quick-sleep-grid">
            {quickSleepValues.map((item) => (
              <button
                type="button"
                key={item.label}
                className="quick-sleep-card"
                onClick={() => applyQuickSleep(item)}
              >
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
                <small>{item.hours} saat</small>
              </button>
            ))}
          </div>

          <div className="sleep-input-grid">
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
              <label>Uyku Süresi (Saat)</label>
              <input
                type="number"
                step="0.1"
                name="sleep_hours"
                value={form.sleep_hours}
                onChange={handleChange}
                placeholder="Örn: 7.5"
              />
            </div>
          </div>

          <button className="sleep-save-btn" type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Uykuyu Kaydet"}
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

        <aside className="sleep-side-panel">
          <div className="sleep-side-card">
            <span>🌙</span>
            <strong>İdeal Aralık</strong>
            <p>7-9 saat çoğu kullanıcı için dengeli uyku aralığıdır.</p>
          </div>

          <div className="sleep-side-card">
            <span>🧠</span>
            <strong>Ruh Hali</strong>
            <p>Düşük uyku süresi ruh hali skorunu da etkileyebilir.</p>
          </div>

          <div className="sleep-side-card warning-card">
            <span>⚠️</span>
            <strong>Düzensizlik</strong>
            <p>Sık düşük uyku haftalık analizlerde sistem tarafından işaretlenebilir.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Sleep;