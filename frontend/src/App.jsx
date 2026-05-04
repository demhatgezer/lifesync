import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/genelCheckUp";
import Meals from "./pages/Meals";
import Expenses from "./pages/Expenses";
import Movement from "./pages/Movement";
import Sleep from "./pages/Sleep";
import Mood from "./pages/Mood";
import Summary from "./pages/Summary";
import Goals from "./pages/Goals";
import "./App.css";
import FoodRecommendations from "./pages/FoodRecommendations";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: "✨", label: "Genel Check-Up" },
    { to: "/summary", icon: "📊", label: "Özet" },
    { to: "/movement", icon: "🏃", label: "Hareket" },
    { to: "/meals", icon: "🥗", label: "Beslenme" },
    { to: "/expenses", icon: "💳", label: "Finansal" },
    { to: "/sleep", icon: "🌙", label: "Uyku" },
    { to: "/mood", icon: "😊", label: "Ruh Hali" },
    { to: "/goals", icon: "🎯", label: "Hedeflerim" },
    { to: "/food-recommendations", icon: "🍽️", label: "Besin Önerileri" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-logo">L</div>
          <div>
            <h2>LifeSync</h2>
            <p>Günlük yaşam asistanı</p>
          </div>
        </div>

        <nav className="side-nav">
          {token ? (
            navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "side-link active-link" : "side-link"
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "side-link active-link" : "side-link"
                }
              >
                <span>🔐</span>
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? "side-link active-link" : "side-link"
                }
              >
                <span>📝</span>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      <main className="main-area">
        <div className="top-panel">
          <div>
            <p className="eyebrow">Bugünü daha iyi yönet</p>
            <h1>Yaşam panelin hazır 🚀</h1>
          </div>

          {token ? (
            <div className="top-profile-card">
              <div className="top-avatar">
                {user?.name?.[0]?.toUpperCase() || "K"}
              </div>

              <div className="top-user-info">
                <strong>{user?.name || "Kullanıcı"}</strong>
                <span>{user?.email || "aktif kullanıcı"}</span>
              </div>

              <button className="top-logout-btn" onClick={handleLogout}>
                Çıkış Yap
              </button>
            </div>
          ) : (
            <div className="quick-stats">
              <div>
                <span>AI</span>
                <strong>Aktif</strong>
              </div>
              <div>
                <span>Takip</span>
                <strong>Günlük</strong>
              </div>
            </div>
          )}
        </div>

        <div className="content-card">
          <Routes>
            <Route
              path="/"
              element={<Navigate to={token ? "/dashboard" : "/login"} />}
            />

            <Route
              path="/login"
              element={token ? <Navigate to="/dashboard" /> : <Login />}
            />

            <Route
              path="/register"
              element={token ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route
  path="/forgot-password"
  element={token ? <Navigate to="/dashboard" /> : <ForgotPassword />}
/>

<Route
  path="/reset-password"
  element={token ? <Navigate to="/dashboard" /> : <ResetPassword />}
/>

            <Route
              path="/dashboard"
              element={token ? <Dashboard /> : <Navigate to="/login" />}
            />

            <Route
              path="/summary"
              element={token ? <Summary /> : <Navigate to="/login" />}
            />

            <Route
              path="/movement"
              element={token ? <Movement /> : <Navigate to="/login" />}
            />

            <Route
              path="/meals"
              element={token ? <Meals /> : <Navigate to="/login" />}
            />

            <Route
              path="/expenses"
              element={token ? <Expenses /> : <Navigate to="/login" />}
            />

            <Route
              path="/sleep"
              element={token ? <Sleep /> : <Navigate to="/login" />}
            />

            <Route
              path="/mood"
              element={token ? <Mood /> : <Navigate to="/login" />}
            />

            <Route
              path="/food-recommendations"
              element={token ? <FoodRecommendations /> : <Navigate to="/login" />}
            />

            <Route
              path="/goals"
              element={token ? <Goals /> : <Navigate to="/login" />}

              
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;