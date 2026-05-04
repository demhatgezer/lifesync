const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const transporter = require("../config/mail");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tum alanlari doldur kankam." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Bu email zaten kayitli." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password_hash: hashedPassword },
    });

    return res.status(201).json({
      message: "Kayit basarili.",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Sunucu hatasi olustu." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email ve sifre gerekli." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Kullanici bulunamadi." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Sifre yanlis." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Giris basarili.",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Sunucu hatasi olustu." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const safeMessage =
      "Eğer bu email kayıtlıysa şifre sıfırlama bağlantısı oluşturuldu.";

    if (!email) {
      return res.status(400).json({ message: "Email gerekli." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({ message: safeMessage });
    }

    const lastToken = await prisma.passwordResetToken.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    if (
      lastToken &&
      Date.now() - new Date(lastToken.created_at).getTime() < 60000
    ) {
      return res.status(429).json({
        message: "Kısa süre içinde tekrar şifre sıfırlama isteği gönderemezsin. Lütfen 1 dakika sonra tekrar dene.",
      });
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        user_id: user.id,
        OR: [
          { used_at: { not: null } },
          { expires_at: { lt: new Date() } },
        ],
      },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "LifeSync Şifre Sıfırlama",
      html: `
        <div style="margin:0;padding:0;background:#eef3ff;font-family:Arial,sans-serif;">
          <div style="max-width:620px;margin:0 auto;padding:32px;">
            <div style="background:#ffffff;border-radius:24px;padding:32px;border:1px solid #e2e8f0;">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#6366f1,#14b8a6);color:white;font-size:24px;font-weight:900;display:flex;align-items:center;justify-content:center;">
                  L
                </div>
                <div>
                  <h2 style="margin:0;color:#172033;font-size:24px;">LifeSync</h2>
                  <p style="margin:2px 0 0;color:#64748b;font-size:14px;">Günlük yaşam asistanı</p>
                </div>
              </div>

              <h1 style="margin:0 0 12px;color:#0f172a;font-size:28px;">Şifreni yenile</h1>

              <p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:1.7;">
                Merhaba <strong>${user.name}</strong>, LifeSync hesabın için şifre sıfırlama isteği aldık.
              </p>

              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.7;">
                Yeni şifre belirlemek için aşağıdaki butona tıklayabilirsin. Bu bağlantı güvenlik nedeniyle 1 saat geçerlidir.
              </p>

              <a href="${resetLink}"
                style="display:inline-block;padding:14px 22px;background:linear-gradient(135deg,#4f46e5,#2563eb);color:white;text-decoration:none;border-radius:14px;font-weight:900;font-size:15px;">
                Şifremi Yenile
              </a>

              <p style="margin:24px 0 0;color:#64748b;font-size:14px;line-height:1.6;">
                Eğer bu isteği sen yapmadıysan bu maili güvenle yok sayabilirsin.
              </p>

              <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:13px;">
                  LifeSync • Günlük yaşamını dengele
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ message: safeMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Sunucu hatasi olustu." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token ve yeni şifre gerekli." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Şifre en az 6 karakter olmalı." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token_hash: tokenHash },
    });

    if (
      !resetRecord ||
      resetRecord.used_at ||
      resetRecord.expires_at < new Date()
    ) {
      return res.status(400).json({
        message: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: resetRecord.user_id },
      data: { password_hash: hashedPassword },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used_at: new Date() },
    });

    return res.status(200).json({ message: "Şifre başarıyla güncellendi." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Sunucu hatasi olustu." });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};