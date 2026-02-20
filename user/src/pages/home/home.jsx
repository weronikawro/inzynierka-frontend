import React, { useState, useEffect } from "react";
import ApiService from "../../utils/api";
import "./home.css";

import DefaultArticleIcon from "../../assets/icons/image.svg";
import DziennikImg from "../../assets/images/dziennik.jpg";
import PrzepisyImg from "../../assets/images/przepisy.jpg";
import DietyImg from "../../assets/images/diety.jpg";

function HomePage({ user, onNavigate }) {
  const [randomArticle, setRandomArticle] = useState(null);
  const [dailyStats, setDailyStats] = useState({ consumed: 0, goal: 2000 });

  useEffect(() => {
    const fetchRandomArticle = async () => {
      try {
        const articles = await ApiService.getArticles();
        if (articles && articles.length > 0) {
          setRandomArticle(
            articles[Math.floor(Math.random() * articles.length)],
          );
        }
      } catch (error) {
        console.error("Błąd pobierania artykułów:", error);
      }
    };
    fetchRandomArticle();
  }, []);

  useEffect(() => {
    if (!user) {
      setDailyStats({ consumed: 0, goal: 2000 });
      return;
    }

    const fetchData = async () => {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        let totalCalories = 0;

        try {
          const diaryEntries = await ApiService.getDiaryEntries(todayStr);
          if (diaryEntries && Array.isArray(diaryEntries)) {
            totalCalories = diaryEntries.reduce((sum, entry) => {
              return sum + (parseFloat(entry.calories) || 0);
            }, 0);
          }
        } catch (err) {}

        let userGoal = user.bmiData?.tdee || 2000;
        if (!user.bmiData) {
          try {
            const bmiRes = await ApiService.getBMIData();
            if (bmiRes?.bmiData?.tdee) userGoal = bmiRes.bmiData.tdee;
          } catch (e) {}
        }

        setDailyStats({
          consumed: Math.round(totalCalories),
          goal: Math.round(parseFloat(userGoal)) || 2000,
        });
      } catch (error) {
        console.error("Błąd główny fetchData:", error);
      }
    };

    fetchData();
  }, [user]);

  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getExcerpt = (text, limit = 100) => {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]*>?/gm, "");
    return cleanText.length > limit
      ? cleanText.substring(0, limit) + "..."
      : cleanText;
  };

  const progressPercent = Math.min(
    (dailyStats.consumed / dailyStats.goal) * 100,
    100,
  );
  const isOverLimit = dailyStats.consumed > dailyStats.goal;

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-text">
          <span className="current-date">{today}</span>
          <h1>
            Witaj
            {user ? (
              <>
                ,{" "}
                <span className="highlight-name">
                  {user?.firstName || user?.userName}
                </span>
                !
              </>
            ) : (
              "!"
            )}
          </h1>
          <p className="subtitle">
            Każdy dzień to nowa okazja, by zadbać o swoje zdrowie. <br />
            Od czego zaczniemy?
          </p>
        </div>

        {user && (
          <div className="mini-status-card">
            <span className="status-label">Twój cel na dziś</span>
            <div className="status-bar-bg">
              <div
                className={`status-bar-fill ${isOverLimit ? "over-limit" : ""}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="status-values">
              <span
                className={`consumed-amount ${isOverLimit ? "over-limit" : ""}`}
              >
                {dailyStats.consumed}
              </span>
              <span>/ {dailyStats.goal} kcal</span>
            </div>
          </div>
        )}
      </header>

      <section className="main-nav-grid">
        <div
          className="nav-card"
          onClick={() => onNavigate && onNavigate("diary")}
        >
          <div className="nav-card-image">
            <img src={DziennikImg} alt="Dziennik" />
            <div className="nav-overlay"></div>
          </div>
          <div className="nav-card-content">
            <h3>Twój Dziennik</h3>
            <p>Monitoruj kalorie, makroskładniki i planuj posiłki.</p>
            <button className="nav-btn">Otwórz dziennik</button>
          </div>
        </div>

        <div
          className="nav-card"
          onClick={() => onNavigate && onNavigate("recipes")}
        >
          <div className="nav-card-image">
            <img src={PrzepisyImg} alt="Przepisy" />
            <div className="nav-overlay"></div>
          </div>
          <div className="nav-card-content">
            <h3>Baza Przepisów</h3>
            <p>Zdrowe inspiracje na śniadanie, obiad i kolację.</p>
            <button className="nav-btn">Szukaj przepisu</button>
          </div>
        </div>

        <div
          className="nav-card"
          onClick={() => onNavigate && onNavigate("diet")}
        >
          <div className="nav-card-image">
            <img src={DietyImg} alt="Diety" />
            <div className="nav-overlay"></div>
          </div>
          <div className="nav-card-content">
            <h3>Rodzaje diet</h3>
            <p>Dowiedz się więcej o dietach eliminacyjnych i zdrowotnych.</p>
            <button className="nav-btn">Zobacz katalog</button>
          </div>
        </div>
      </section>

      <section className="featured-section compact-version">
        <div className="section-header-row">
          <h2>Warto wiedzieć</h2>
          <button
            className="link-btn"
            onClick={() => onNavigate && onNavigate("articles")}
          >
            Wszystkie artykuły &rarr;
          </button>
        </div>

        {randomArticle ? (
          <div
            className="featured-article-card nav-card-hover-effect"
            onClick={() => onNavigate && onNavigate("articles", randomArticle)}
          >
            <div className="featured-text">
              <span className="tag">
                {randomArticle.category || "Polecamy"}
              </span>
              <h3>{randomArticle.title}</h3>
              <p>
                {getExcerpt(
                  randomArticle.description || randomArticle.content,
                  110,
                )}
              </p>
              <button className="read-btn">Czytaj</button>
            </div>
            <div
              className={`featured-img-container ${!randomArticle.image ? "has-placeholder" : ""}`}
            >
              <img src={randomArticle.image || DefaultArticleIcon} alt="" />
            </div>
          </div>
        ) : (
          <div className="featured-article-card placeholder-card">
            <div className="featured-text">
              <h3>Ładowanie...</h3>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
