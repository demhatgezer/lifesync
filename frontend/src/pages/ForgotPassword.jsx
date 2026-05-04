import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });

      setMessage(
  "Şifre sıfırlama bağlantısı gönderildi. Lütfen email kutunu kontrol et."
);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Şifre sıfırlama isteği sırasında hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-badge">🔑 LifeSync</div>

        <h1>Şifreni güvenli şekilde yenile.</h1>

        <p>
          Hesabına ait email adresini gir. Sana şifre sıfırlama bağlantısı
          oluşturalım.
        </p>

        <div className="auth-feature-grid">
          <div>
            <span>📩</span>
            <strong>Email</strong>
            <p>Hesabını email ile doğrula</p>
          </div>

          <div>
            <span>⏳</span>
            <strong>Süreli Link</strong>
            <p>Bağlantı 1 saat geçerlidir</p>
          </div>

          <div>
            <span>🔐</span>
            <strong>Güvenlik</strong>
            <p>Token ile şifre yenileme</p>
          </div>

          <div>
            <span>✅</span>
            <strong>Yeni Şifre</strong>
            <p>Hesabına tekrar eriş</p>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span>🔑</span>
          <h2>Şifremi unuttum</h2>
          <p>Email adresini gir, şifre yenileme bağlantını oluşturalım.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
          </button>
        </form>

        {message && (
          <div
            className={
              message.toLowerCase().includes("hata")
                ? "message-error"
                : "message-success"
            }
          >
            {message}
          </div>
        )}

        <p className="auth-switch">
          Şifreni hatırladın mı? <Link to="/login">Giriş yap</Link>
        </p>
      </section>
    </div>
  );
}

export default ForgotPassword;