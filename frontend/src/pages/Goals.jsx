import { useEffect, useState } from "react";

function Goals() {
  const [goals, setGoals] = useState({
    step_goal: 10000,
    sleep_goal: 8,
    exercise_goal: 60,
    spending_limit: 500,
    protein_goal: 100,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:5000/goals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.data) {
          setGoals({
            step_goal: data.data.step_goal,
            sleep_goal: Number(data.data.sleep_goal),
            exercise_goal: data.data.exercise_goal,
            spending_limit: Number(data.data.spending_limit),
            protein_goal: Number(data.data.protein_goal),
          });
        }
      } catch (error) {
        console.error("Goals fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [token]);

  const handleChange = (e) => {
    setGoals({
      ...goals,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch("http://localhost:5000/goals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goals),
      });

      if (response.ok) {
        alert("Hedefler başarıyla güncellendi 🚀");
      } else {
        alert("Bir hata oluştu.");
      }
    } catch (error) {
      console.error("Goals save error:", error);
      alert("Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  };

  const cards = [
    {
      name: "step_goal",
      icon: "👣",
      title: "Günlük Adım",
      text: "Bugün ulaşmak istediğin adım hedefi.",
      unit: "adım",
      value: goals.step_goal,
    },
    {
  name: "protein_goal",
  icon: "🥩",
  title: "Protein Hedefi",
  text: "Günlük ulaşmak istediğin protein miktarı.",
  unit: "g",
  value: goals.protein_goal,
},
    {
      name: "sleep_goal",
      icon: "🌙",
      title: "Uyku",
      text: "Günlük hedeflediğin uyku süresi.",
      unit: "saat",
      value: goals.sleep_goal,
    },
    {
      name: "exercise_goal",
      icon: "💪",
      title: "Egzersiz",
      text: "Günlük aktif hareket hedefin.",
      unit: "dk",
      value: goals.exercise_goal,
    },
    {
      name: "spending_limit",
      icon: "💳",
      title: "Harcama Limiti",
      text: "Günlük harcama sınırın.",
      unit: "TL",
      value: goals.spending_limit,
    },
  ];

  return (
    <>
      <style>{`
        .goals-clean-page {
          display: flex;
          flex-direction: column;
          gap: 28px;
          color: #182033;
        }

        .goals-clean-hero {
          padding: 34px;
          border-radius: 32px;
          background: linear-gradient(135deg, #ffffff 0%, #eef7ff 55%, #eef1ff 100%);
          box-shadow: 0 24px 55px rgba(31, 41, 55, 0.08);
          display: flex;
          justify-content: space-between;
          gap: 30px;
          align-items: center;
        }

        .goals-clean-hero h1 {
          margin: 10px 0;
          font-size: 42px;
          color: #172033;
        }

        .goals-clean-hero p {
          max-width: 720px;
          color: #64748b;
          line-height: 1.7;
          font-size: 16px;
        }

        .goals-pill {
          display: inline-flex;
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(99, 91, 255, 0.12);
          color: #4f46e5;
          font-weight: 800;
          font-size: 13px;
        }

        .goals-clean-focus {
          min-width: 230px;
          padding: 24px;
          border-radius: 28px;
          background: linear-gradient(135deg, #5b5cff, #18c7d7);
          color: white;
          box-shadow: 0 20px 45px rgba(91, 92, 255, 0.28);
        }

        .goals-clean-focus span {
          opacity: .85;
          font-size: 14px;
        }

        .goals-clean-focus strong {
          display: block;
          margin: 10px 0;
          font-size: 25px;
        }

        .goals-clean-focus p {
          color: rgba(255,255,255,.85);
          margin: 0;
          font-size: 14px;
        }

        .goals-clean-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .goals-clean-card {
          padding: 26px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 22px 48px rgba(30, 41, 59, 0.09);
          border: 1px solid rgba(226, 232, 240, 0.9);
        }

        .goals-card-top {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
        }

        .goals-card-icon {
          width: 58px;
          height: 58px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          font-size: 28px;
          background: #eef4ff;
        }

        .goals-card-top h2 {
          margin: 0 0 5px;
          font-size: 23px;
          color: #172033;
        }

        .goals-card-top p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .goals-input-wrap {
          display: flex;
          align-items: center;
          background: #f8fbff;
          border: 1px solid #dbe5f2;
          border-radius: 20px;
          overflow: hidden;
        }

        .goals-input-wrap input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 18px 20px;
          font-size: 24px;
          font-weight: 900;
          color: #172033;
          min-width: 0;
        }

        .goals-input-wrap span {
          padding: 18px 20px;
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 900;
          height: 100%;
        }

        .goals-preview {
          margin-top: 18px;
          padding: 15px 17px;
          border-radius: 18px;
          background: linear-gradient(135deg, #f8fbff, #eefcff);
          display: flex;
          justify-content: space-between;
          color: #64748b;
          font-weight: 700;
        }

        .goals-preview strong {
          color: #172033;
        }

        .goals-save-box {
          padding: 28px;
          border-radius: 32px;
          background: #172033;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          box-shadow: 0 24px 55px rgba(23, 32, 51, 0.2);
        }

        .goals-save-box h2 {
          margin: 0 0 8px;
          font-size: 26px;
        }

        .goals-save-box p {
          margin: 0;
          color: rgba(255,255,255,.7);
        }

        .goals-save-box button {
          border: none;
          padding: 17px 28px;
          border-radius: 18px;
          background: linear-gradient(135deg, #6c63ff, #18c7d7);
          color: white;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 18px 36px rgba(99, 91, 255, 0.35);
        }

        .goals-save-box button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .goals-clean-hero,
          .goals-save-box {
            flex-direction: column;
            align-items: stretch;
          }

          .goals-clean-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="goals-clean-page">
        <section className="goals-clean-hero">
          <div>
            <span className="goals-pill">Kişisel hedefler</span>
            <h1>Hedeflerini belirle 🎯</h1>
            <p>
              Günlük adım, uyku, egzersiz ve harcama hedeflerini buradan
              belirleyebilirsin. LifeSync bu hedeflere göre seni daha anlamlı
              şekilde yönlendirecek.
            </p>
          </div>

          <div className="goals-clean-focus">
            <span>Bugünkü odak</span>
            <strong>Dengeyi koru</strong>
            <p>Küçük hedefler, sürdürülebilir alışkanlıklar oluşturur.</p>
          </div>
        </section>

        {loading ? (
          <div className="goals-clean-card">Hedefler yükleniyor...</div>
        ) : (
          <>
            <section className="goals-clean-grid">
              {cards.map((card) => (
                <div className="goals-clean-card" key={card.name}>
                  <div className="goals-card-top">
                    <div className="goals-card-icon">{card.icon}</div>
                    <div>
                      <h2>{card.title}</h2>
                      <p>{card.text}</p>
                    </div>
                  </div>

                  <div className="goals-input-wrap">
                    <input
                      type="number"
                      name={card.name}
                      value={card.value}
                      onChange={handleChange}
                    />
                    <span>{card.unit}</span>
                  </div>

                  <div className="goals-preview">
                    <span>Aktif hedef</span>
                    <strong>
                      {card.value} {card.unit}
                    </strong>
                  </div>
                </div>
              ))}
            </section>

            <section className="goals-save-box">
              <div>
                <h2>LifeSync’i kişiselleştir</h2>
                <p>
                  Kaydettiğin hedefler dashboard, özet ve AI önerilerinde
                  kullanılacak.
                </p>
              </div>

              <button onClick={handleSave} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Hedefleri Kaydet"}
              </button>
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default Goals;