import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage("Giriş başarılı.");
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Giriş sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-badge">✨ LifeSync</div>

        <h1>Gününü takip et, yaşamını dengele.</h1>

        <p>
          Hareket, uyku, beslenme, ruh hali ve harcamalarını tek panelden yönet.
          Sistem seni analiz etsin ve daha iyi kararlar için öneriler sunsun.
        </p>

        <div className="auth-feature-grid">
          <div>
            <span>🏃</span>
            <strong>Hareket</strong>
            <p>Adım ve egzersiz takibi</p>
          </div>

          <div>
            <span>🥗</span>
            <strong>Beslenme</strong>
            <p>Öğün ve protein kontrolü</p>
          </div>

          <div>
            <span>🌙</span>
            <strong>Uyku</strong>
            <p>Günlük uyku analizi</p>
          </div>

          <div>
            <span>💳</span>
            <strong>Finans</strong>
            <p>Harcama alışkanlıkları</p>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>🔐</span>
          <h2>Tekrar hoş geldin</h2>
          <p>Hesabına giriş yap ve günlük paneline devam et.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Şifre</label>
            <input
              type="password"
              name="password"
              placeholder="Şifreni gir"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="forgot-password-link">
  <Link to="/forgot-password">Şifremi unuttum?</Link>
</div>

          <button type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        {message && (
          <div
            className={
              message.toLowerCase().includes("hata") ||
              message.toLowerCase().includes("yanlis") ||
              message.toLowerCase().includes("bulunamadi")
                ? "message-error"
                : "message-success"
            }
          >
            {message}
          </div>
        )}

        <p className="auth-switch">
          Hesabın yok mu? <Link to="/register">Hemen kayıt ol</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;