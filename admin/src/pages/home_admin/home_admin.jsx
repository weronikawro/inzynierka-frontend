import React, { useEffect, useState } from "react";
import ApiService from "../../utils/api";
import "./home_admin.css";

import UsersIcon from "../../assets/icons/users.svg";
import RecipesIcon from "../../assets/icons/recipes.svg";
import ArticlesIcon from "../../assets/icons/articles.svg";

const ActivityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Brak danych do wyświetlenia</div>;
  }

  const height = 250;
  const width = 1000;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const allValues = data.flatMap((d) => [d.users, d.recipes, d.articles]);
  const maxValue = Math.max(...allValues, 5);

  const dayWidth = chartWidth / data.length;
  const barGap = 1;
  const groupPadding = dayWidth * 0.2;
  const barWidth = (dayWidth - groupPadding) / 3;

  const getY = (val) =>
    paddingTop + chartHeight - (val / maxValue) * chartHeight;

  return (
    <div className="chart-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="activity-chart-svg"
        preserveAspectRatio="none"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const val = Math.round(maxValue * t);
          const yPos = getY(maxValue * t);
          return (
            <g key={t}>
              <line
                x1={paddingLeft}
                y1={yPos}
                x2={width - paddingRight}
                y2={yPos}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={yPos + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
              >
                {val}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const xBase = paddingLeft + i * dayWidth + groupPadding / 2;
          return (
            <g key={i}>
              <rect
                x={xBase}
                y={getY(d.users)}
                width={barWidth - barGap}
                height={Math.max(chartHeight - (getY(d.users) - paddingTop), 0)}
                fill="#6366f1"
                rx="2"
              />
              <rect
                x={xBase + barWidth}
                y={getY(d.recipes)}
                width={barWidth - barGap}
                height={Math.max(
                  chartHeight - (getY(d.recipes) - paddingTop),
                  0,
                )}
                fill="#f59e0b"
                rx="2"
              />
              <rect
                x={xBase + barWidth * 2}
                y={getY(d.articles)}
                width={barWidth - barGap}
                height={Math.max(
                  chartHeight - (getY(d.articles) - paddingTop),
                  0,
                )}
                fill="#10b981"
                rx="2"
              />
              {(data.length < 15 || i % 5 === 0) && (
                <text
                  x={xBase + barWidth * 1.5}
                  y={height - 10}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {d.day}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

function AdminHomePage({ user, onNavigate }) {
  const [stats, setStats] = useState({ users: 0, recipes: 0, articles: 0 });
  const [recentData, setRecentData] = useState({ articles: [], recipes: [] });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const categoryTranslations = {
    breakfast: "Śniadanie",
    lunch: "Obiad",
    dinner: "Kolacja",
    snack: "Przekąska",
    dessert: "Deser",
    drink: "Napój",
  };

  useEffect(() => {
    const fetchStaticData = async () => {
      setLoading(true);
      try {
        const [statsRes, recentRes] = await Promise.all([
          ApiService.getAdminStats(),
          ApiService.getDashboardRecent(),
        ]);
        setStats(statsRes);
        setRecentData(recentRes);
      } catch (error) {
        console.error("Błąd statystyk:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const res = await ApiService.getAdminMonthlyStats(
          currentDate.getMonth(),
          currentDate.getFullYear(),
        );
        setChartData(res || []);
      } catch (e) {
        console.error("Błąd wykresu:", e);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [currentDate]);

  const changeMonth = (delta) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + delta);
    setCurrentDate(next);
  };

  const formatDateSimple = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("pl-PL") : "-";

  return (
    <div className="admin-container">
      <div className="admin-page-header">
        <div>
          <h1>
            Witaj,{" "}
            <span className="welcome-name-highlight">
              {user?.firstName || "Admin"}
            </span>
          </h1>
          <p>Panel zarządzania aplikacją</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-icon user-bg">
            <img src={UsersIcon} alt="Users" />
          </div>
          <div className="stats-content">
            <span className="stats-number">
              {loading ? "..." : stats.users}
            </span>
            <span className="stats-label">Użytkowników</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon recipe-bg">
            <img src={RecipesIcon} alt="Recipes" />
          </div>
          <div className="stats-content">
            <span className="stats-number">
              {loading ? "..." : stats.recipes}
            </span>
            <span className="stats-label">Przepisów</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon article-bg">
            <img src={ArticlesIcon} alt="Articles" />
          </div>
          <div className="stats-content">
            <span className="stats-number">
              {loading ? "..." : stats.articles}
            </span>
            <span className="stats-label">Artykułów</span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <div className="chart-nav-group">
            <h3>Aktywność dzienna</h3>
            <div className="chart-controls">
              <button className="chart-nav-btn" onClick={() => changeMonth(-1)}>
                &lt;
              </button>
              <span className="current-month-label">
                {currentDate.toLocaleDateString("pl-PL", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button className="chart-nav-btn" onClick={() => changeMonth(1)}>
                &gt;
              </button>
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot dot-users"></span> Użytkownicy
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-recipes"></span> Przepisy
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-articles"></span> Artykuły
            </div>
          </div>
        </div>
        {chartLoading ? (
          <div className="chart-loader">Ładowanie...</div>
        ) : (
          <ActivityChart data={chartData} />
        )}
      </div>

      <div className="recent-activity-grid">
        <div className="activity-card">
          <div className="activity-header">
            <h3>Najnowsze artykuły</h3>
            <span
              className="view-all-link"
              onClick={() => onNavigate("articles")}
            >
              Zobacz wszystkie
            </span>
          </div>
          <ul className="activity-list">
            {recentData.articles?.map((a) => (
              <li key={a._id} className="activity-item">
                <div className="activity-avatar">
                  {a.image ? <img src={a.image} alt="" /> : "📄"}
                </div>
                <div className="activity-details">
                  <span className="activity-name">{a.title}</span>
                  <span className="activity-sub">{a.category}</span>
                </div>
                <span className="activity-date">
                  {formatDateSimple(a.date || a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="activity-card">
          <div className="activity-header">
            <h3>Najnowsze przepisy</h3>
            <span
              className="view-all-link"
              onClick={() => onNavigate("recipes")}
            >
              Zarządzaj
            </span>
          </div>
          <ul className="activity-list">
            {recentData.recipes?.map((r) => (
              <li key={r._id} className="activity-item">
                <div className="activity-avatar">
                  {r.image ? <img src={r.image} alt="" /> : "🍲"}
                </div>
                <div className="activity-details">
                  <span className="activity-name">{r.name}</span>
                  <span className="activity-sub">
                    {categoryTranslations[r.category] || r.category || "Inne"} •{" "}
                    {r.calories} kcal
                  </span>
                </div>
                <span className="activity-date">
                  {formatDateSimple(r.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminHomePage;
