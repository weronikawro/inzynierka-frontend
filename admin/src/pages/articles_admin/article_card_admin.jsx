import React from "react";
import "./articles_admin.css";
import ImageIcon from "../../assets/icons/image.svg";

function ArticleCard({ article, onClick, isAdmin, onDelete }) {
  const badgeText = article.label || "Artykuł";

  return (
    <div className="article-card">
      {isAdmin && (
        <button
          className="delete-recipe-card-btn card-delete-btn"
          onClick={onDelete}
          title="Usuń artykuł"
        >
          ×
        </button>
      )}

      <div className="article-image-container">
        <span className="article-badge">{badgeText}</span>
        {article.image ? (
          <img src={article.image} alt={article.title} />
        ) : (
          <div className="article-placeholder-card">
            <img src={ImageIcon} alt="" className="article-placeholder-icon" />
          </div>
        )}
      </div>
      <div className="article-content">
        <h3 className="article-title">{article.title}</h3>
        <span className="article-date">{article.date}</span>
        <p className="article-excerpt">{article.excerpt}</p>
        <button className="read-more-btn" onClick={onClick}>
          Czytaj więcej
        </button>
      </div>
    </div>
  );
}

export default ArticleCard;
