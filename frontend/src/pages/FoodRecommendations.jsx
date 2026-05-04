import { useEffect, useState } from "react";

function FoodRecommendations() {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [proteinData, setProteinData] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/foods/protein-recommendations?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setProteinData(data.data);
      } else {
        alert(data.message || "Öneriler alınamadı.");
      }
    } catch (error) {
      console.error("Food recommendation error:", error);
      alert("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedDate]);

  return (
    <>
      <style>{`
        .food-rec-page {
          display: flex;
          flex-direction: column;
          gap: 26px;
          color: #172033;
        }

        .food-rec-hero {
          padding: 34px;
          border-radius: 32px;
          background: linear-gradient(135deg, #ffffff, #eefcff);
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
          box-shadow: 0 24px 55px rgba(30, 41, 59, 0.08);
        }

        .food-rec-hero h1 {
          margin: 10px 0;
          font-size: 40px;
        }

        .food-rec-hero p {
          color: #64748b;
          max-width: 720px;
          line-height: 1.7;
        }

        .food-date-card {
          padding: 22px;
          border-radius: 24px;
          background: #172033;
          color: white;
          min-width: 250px;
        }

        .food-date-card input {
          margin-top: 12px;
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 14px;
        }

        .food-pill {
          display: inline-flex;
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          font-weight: 900;
          font-size: 13px;
        }

        .protein-status-card {
          padding: 28px;
          border-radius: 30px;
          background: linear-gradient(135deg, #5b5cff, #18c7d7);
          color: white;
          box-shadow: 0 22px 50px rgba(91, 92, 255, 0.24);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .protein-stat {
          padding: 18px;
          border-radius: 22px;
          background: rgba(255,255,255,.14);
        }

        .protein-stat span {
          display: block;
          opacity: .85;
          margin-bottom: 8px;
        }

        .protein-stat strong {
          font-size: 28px;
        }

        .food-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .food-card {
          padding: 24px;
          border-radius: 28px;
          background: rgba(255,255,255,.96);
          border: 1px solid rgba(226,232,240,.9);
          box-shadow: 0 20px 44px rgba(30,41,59,.08);
        }

        .food-card-icon {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: #ecfdf5;
          display: grid;
          place-items: center;
          font-size: 26px;
          margin-bottom: 16px;
        }

        .food-card h2 {
          margin: 0 0 6px;
          font-size: 21px;
        }

        .food-card p {
          margin: 0 0 14px;
          color: #64748b;
        }

        .macro-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .macro-row span {
          padding: 8px 10px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #334155;
          font-weight: 800;
          font-size: 13px;
        }

        .food-info-box {
          padding: 24px;
          border-radius: 28px;
          background: #fff7ed;
          color: #9a3412;
          line-height: 1.7;
          font-weight: 700;
        }

        @media (max-width: 1000px) {
          .food-rec-hero,
          .protein-status-card {
            grid-template-columns: 1fr;
            flex-direction: column;
            align-items: stretch;
          }

          .food-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="food-rec-page">
        <section className="food-rec-hero">
          <div>
            <span className="food-pill">Akıllı beslenme önerisi</span>
            <h1>Bugün ne yemeliyim? 🥗</h1>
            <p>
              LifeSync, günlük protein durumunu kontrol eder. Eğer protein
              alımın düşükse protein oranı yüksek besinleri sana önerir.
            </p>
          </div>

          <div className="food-date-card">
            <strong>Analiz tarihi</strong>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </section>

        {loading ? (
          <div className="food-info-box">Öneriler yükleniyor...</div>
        ) : proteinData ? (
          <>
            <section className="protein-status-card">
              <div className="protein-stat">
                <span>Günlük hedef</span>
                <strong>{proteinData.protein_goal}g</strong>
              </div>

              <div className="protein-stat">
                <span>Bugünkü alım</span>
                <strong>{proteinData.total_protein}g</strong>
              </div>

              <div className="protein-stat">
                <span>Eksik protein</span>
                <strong>{proteinData.missing_protein}g</strong>
              </div>
            </section>

            <div className="food-info-box">{proteinData.missing_protein > 0
              ? `Bugün protein hedefinin altında kalmışsın. Aşağıdaki besinleri tercih edebilirsin.`
              : `Bugünkü protein hedefin iyi görünüyor. Yine de dengeli beslenmek için önerilere göz atabilirsin.`
            }</div>

            <section className="food-grid">
              {proteinData.recommendations.map((food) => (
                <div className="food-card" key={food.id}>
                  <div className="food-card-icon">🍽️</div>
                  <h2>{food.name}</h2>
                  <p>{food.category}</p>

                  <div className="macro-row">
                    <span>{Number(food.protein).toFixed(1)}g protein</span>
                    <span>{food.calories} kcal</span>
                    <span>{Number(food.carbs).toFixed(1)}g karbonhidrat</span>
                    <span>{Number(food.fat).toFixed(1)}g yağ</span>
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : (
          <div className="food-info-box">Henüz öneri bulunamadı.</div>
        )}
      </div>
    </>
  );
}

export default FoodRecommendations;