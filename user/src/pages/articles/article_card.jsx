import React from "react";
import "./articles.css";
import ImageIcon from "../../assets/icons/image.svg";

function ArticleCard({ article, onClick }) {
  return (
    <div className="article-card" onClick={onClick}>
      <div className="article-image-container">
        <span className="article-badge">{article.label || "Artykuł"}</span>

        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="article-card-img"
          />
        ) : (
          <div className="article-placeholder-card">
            <img
              src={ImageIcon}
              alt="Brak zdjęcia"
              className="article-placeholder-icon"
            />
          </div>
        )}
      </div>
      <div className="article-content">
        <h3 className="article-title">{article.title}</h3>
        <span className="article-date">{article.date}</span>
        <p className="article-excerpt">{article.excerpt}</p>
        <button className="read-more-btn">Czytaj więcej</button>
      </div>
    </div>
  );
}

export default ArticleCard;
