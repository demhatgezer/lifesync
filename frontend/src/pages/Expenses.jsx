import { useMemo, useState } from "react";
import api from "../services/api";

function Expenses() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    title: "",
    category: "yemek",
    amount: "",
    note: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: "yemek", label: "Yemek", icon: "🍔", desc: "Market, restoran, kahve" },
    { value: "ulasim", label: "Ulaşım", icon: "🚌", desc: "Otobüs, taksi, yakıt" },
    { value: "eglence", label: "Eğlence", icon: "🎮", desc: "Sinema, oyun, etkinlik" },
    { value: "giyim", label: "Giyim", icon: "👕", desc: "Kıyafet ve aksesuar" },
    { value: "fatura", label: "Fatura", icon: "🧾", desc: "Elektrik, su, internet" },
    { value: "diger", label: "Diğer", icon: "💼", desc: "Diğer harcamalar" },
  ];

  const selectedCategory =
    categories.find((item) => item.value === form.category) || categories[0];

  const amountNumber = Number(form.amount || 0);

  const financeScore = useMemo(() => {
    if (amountNumber === 0) return 100;
    if (amountNumber <= 150) return 90;
    if (amountNumber <= 300) return 75;
    if (amountNumber <= 600) return 55;
    if (amountNumber <= 1000) return 35;
    return 20;
  }, [amountNumber]);

  const financeStatus =
    financeScore >= 80
      ? "Kontrollü"
      : financeScore >= 55
      ? "Dikkatli"
      : "Yüksek Harcama";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategorySelect = (category) => {
    setForm({
      ...form,
      category,
    });
  };

  const fillQuickExpense = (title, category, amount) => {
    setForm({
      ...form,
      title,
      category,
      amount,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        date: form.date,
        title: form.title,
        category: form.category,
        amount: Number(form.amount),
        note: form.note,
      };

      const response = await api.post("/expenses", payload);

      setMessage(response.data.message || "Harcama kaydı oluşturuldu.");
      setForm({
        date: today,
        title: "",
        category: "yemek",
        amount: "",
        note: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expenses-page">
      <section className="expenses-hero">
        <div>
          <span className="hero-pill">Finans merkezi</span>
          <h1>Bugünkü harcamanı kaydet 💳</h1>
          <p>
            Günlük harcamalarını kategori bazlı kaydet. Böylece sistem haftalık
            harcama düzenini analiz edip sana daha bilinçli öneriler sunabilir.
          </p>
        </div>

        <div className="expense-preview-card">
          <div className="expense-preview-icon">{selectedCategory.icon}</div>
          <span>Seçili kategori</span>
          <strong>{selectedCategory.label}</strong>
          <p>{selectedCategory.desc}</p>
        </div>
      </section>

      <section className="expense-score-row">
        <div className="expense-score-card">
          <div>
            <span className="summary-mini-label">Finans ön skoru</span>
            <h2>{financeScore}/100</h2>
            <p>
              Bu skor girdiğin harcama tutarına göre ön izleme amaçlı hesaplanır.
              Harcama yükseldikçe skor düşer.
            </p>
          </div>

          <div className="expense-meter">
            <strong>{financeStatus}</strong>
            <div className="expense-score-bar">
              <span style={{ width: `${financeScore}%` }}></span>
            </div>
          </div>
        </div>

        <div className="expense-tip-card">
          <span>💡</span>
          <div>
            <strong>Mini öneri</strong>
            <p>
              Kategori adlarını düzenli kullanırsan sistem haftalık raporda hangi
              alana fazla harcadığını daha net gösterir.
            </p>
          </div>
        </div>
      </section>

      <section className="expense-workspace">
        <form className="expense-form-panel" onSubmit={handleSubmit}>
          <div className="panel-head">
            <div>
              <span className="summary-mini-label">Harcama girişi</span>
              <h2>Finansal Veri</h2>
            </div>
            <strong>{form.date}</strong>
          </div>

          <div className="expense-category-grid">
            {categories.map((item) => (
              <button
                type="button"
                key={item.value}
                className={
                  form.category === item.value
                    ? "expense-category-card selected-expense"
                    : "expense-category-card"
                }
                onClick={() => handleCategorySelect(item.value)}
              >
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>

          <div className="expense-input-grid">
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
              <label>Tutar</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Örn: 250"
              />
            </div>

            <div>
              <label>Başlık</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Örn: Market alışverişi"
              />
            </div>

            <div>
              <label>Kategori</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {categories.map((item) => (
                  <option value={item.value} key={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="full-input">
              <label>Not</label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Opsiyonel not ekle"
                rows="4"
              />
            </div>
          </div>

          <div className="quick-expense-area">
            <span>Hızlı örnek doldur:</span>
            <div>
              <button
                type="button"
                onClick={() => fillQuickExpense("Kahve", "yemek", "80")}
              >
                ☕ Kahve
              </button>
              <button
                type="button"
                onClick={() => fillQuickExpense("Market", "yemek", "350")}
              >
                🛒 Market
              </button>
              <button
                type="button"
                onClick={() => fillQuickExpense("Otobüs", "ulasim", "30")}
              >
                🚌 Otobüs
              </button>
              <button
                type="button"
                onClick={() => fillQuickExpense("Sinema", "eglence", "180")}
              >
                🎬 Sinema
              </button>
            </div>
          </div>

          <button className="expense-save-btn" type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Harcamayı Kaydet"}
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

        <aside className="expense-side-panel">
          <div className="expense-side-card">
            <span>📊</span>
            <strong>Kategori Takibi</strong>
            <p>Her harcamayı doğru kategoriyle girersen haftalık rapor daha anlamlı olur.</p>
          </div>

          <div className="expense-side-card">
            <span>🎯</span>
            <strong>Günlük Limit</strong>
            <p>İleride buraya kullanıcıya özel günlük bütçe hedefi ekleyebiliriz.</p>
          </div>

          <div className="expense-side-card warning-card">
            <span>⚠️</span>
            <strong>Yüksek Harcama</strong>
            <p>Yemek veya eğlence harcaması artarsa sistem kullanıcıyı uyarabilir.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Expenses;