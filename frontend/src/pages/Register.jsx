import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { text: "Zayıf", className: "weak", percent: 33 };
    }

    if (score <= 4) {
      return { text: "Orta", className: "medium", percent: 66 };
    }

    return { text: "Güçlü", className: "strong", percent: 100 };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalı.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      setMessage(response.data.message || "Kayıt başarılı.");

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (error) {
      setMessage(error.response?.data?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual register-visual">
        <div className="auth-badge">🚀 Yeni başlangıç</div>

        <h1>Kendi yaşam panelini bugün oluştur.</h1>

        <p>
          Günlük alışkanlıklarını kaydet, haftalık raporlarını gör ve kişisel
          önerilerle daha dengeli bir rutin kur.
        </p>

        <div className="auth-progress-card">
          <div>
            <span>Günlük takip</span>
            <strong>%100</strong>
          </div>
          <div className="fake-progress">
            <span style={{ width: "82%" }}></span>
          </div>
          <p>Verilerini düzenli girdikçe sistem seni daha iyi analiz eder.</p>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>📝</span>
          <h2>Hesap oluştur</h2>
          <p>LifeSync’e katıl ve günlük yaşamını daha akıllı takip et.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label>Ad Soyad</label>
            <input
              type="text"
              name="name"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={handleChange}
            />
          </div>

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
              placeholder="En az 6 karakter önerilir"
              value={form.password}
              onChange={handleChange}
            />

            {form.password && (
              <div className="password-strength">
                <div className="password-strength-top">
                  <span>Şifre gücü</span>
                  <strong className={passwordStrength.className}>
                    {passwordStrength.text}
                  </strong>
                </div>

                <div className="password-strength-bar">
                  <span
                    className={passwordStrength.className}
                    style={{ width: `${passwordStrength.percent}%` }}
                  ></span>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>

        {message && (
          <div
            className={
              message.toLowerCase().includes("hata") ||
              message.toLowerCase().includes("zaten") ||
              message.toLowerCase().includes("şifre")
                ? "message-error"
                : "message-success"
            }
          >
            {message}
          </div>
        )}

        <p className="auth-switch">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;