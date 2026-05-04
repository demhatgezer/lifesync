import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        text: "Zayıf",
        className: "weak",
        percent: 33,
      };
    }

    if (score <= 4) {
      return {
        text: "Orta",
        className: "medium",
        percent: 66,
      };
    }

    return {
      text: "Güçlü",
      className: "strong",
      percent: 100,
    };
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

    if (!token) {
      setMessage("Şifre sıfırlama tokenı bulunamadı.");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password: form.password,
      });

      setMessage(response.data.message || "Şifre başarıyla güncellendi.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Şifre güncellenirken hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual register-visual">
        <div className="auth-badge">🔐 LifeSync</div>

        <h1>Yeni şifreni belirle.</h1>

        <p>
          Güvenliğin için güçlü ve hatırlanabilir bir şifre oluştur. İşlemden
          sonra tekrar giriş sayfasına yönlendirileceksin.
        </p>

        <div className="auth-feature-grid">
          <div>
            <span>🧠</span>
            <strong>Hatırlanabilir</strong>
            <p>Kendine uygun şifre seç</p>
          </div>

          <div>
            <span>🔒</span>
            <strong>Güvenli</strong>
            <p>En az 6 karakter kullan</p>
          </div>

          <div>
            <span>♻️</span>
            <strong>Yenile</strong>
            <p>Eski şifren geçersiz olur</p>
          </div>

          <div>
            <span>🚀</span>
            <strong>Devam Et</strong>
            <p>LifeSync paneline dön</p>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>🔐</span>
          <h2>Yeni şifre</h2>
          <p>Hesabın için yeni şifre belirle.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label>Yeni şifre</label>
            <input
              type="password"
              name="password"
              placeholder="Yeni şifreni gir"
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

          <div>
            <label>Yeni şifre tekrar</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Yeni şifreni tekrar gir"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>

        {message && (
          <div
            className={
              message.toLowerCase().includes("başarı")
                ? "message-success"
                : "message-error"
            }
          >
            {message}
          </div>
        )}

        <p className="auth-switch">
          Giriş sayfasına dön <Link to="/login">Giriş yap</Link>
        </p>
      </section>
    </div>
  );
}

export default ResetPassword;