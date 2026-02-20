import React, { useState, useEffect } from "react";
import ApiService from "../../utils/api.js";
import ArticleCard from "./article_card.jsx";
import ArticleDetails from "./article_details.jsx";
import "./articles.css";

function ArticlesPage({ initialData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(initialData || null);

  const categories = [
    { id: "all", label: "Wszystkie" },
    { id: "porady", label: "Porady i Edukacja" },
    { id: "zdrowie", label: "Zdrowie i Choroby" },
    { id: "suplementacja", label: "Suplementacja" },
    { id: "styl_zycia", label: "Styl Życia" },
  ];

  useEffect(() => {
    if (initialData) {
      setSelectedArticle(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getArticles();
      setArticles(data);
      setFilteredArticles(data);
    } catch (err) {
      setError("Nie udało się pobrać artykułów.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = articles;
    if (activeCategory !== "all") {
      result = result.filter((article) => article.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query),
      );
    }
    setFilteredArticles(result);
  }, [searchQuery, activeCategory, articles]);

  useEffect(() => {
    if (selectedArticle) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll");
  }, [selectedArticle]);

  return (
    <div className="content-container">
      <div
        className={`articles-main-view ${selectedArticle ? "hidden-view" : ""}`}
      >
        <div className="articles-top-section">
          <div className="articles-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`article-tab-btn ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="articles-search-container">
            <input
              type="text"
              className="articles-search-input"
              placeholder="Szukaj w artykułach..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="articles-grid">
          {loading ? (
            <div className="loading-message">Ładowanie artykułów...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <ArticleCard
                key={article._id || article.id}
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            ))
          ) : (
            <div className="no-results">Nie znaleziono artykułów.</div>
          )}
        </div>
      </div>
      {selectedArticle && (
        <div className="modal-overlay fullscreen-overlay">
          <ArticleDetails
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        </div>
      )}
    </div>
  );
}

export default ArticlesPage;
