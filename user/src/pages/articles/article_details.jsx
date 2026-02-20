import React from "react";
import "./articles.css";
import ImageIcon from "../../assets/icons/image.svg";

function ArticleDetails({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="article-details-container">
      <div className="article-details-header">
        <button className="close-details-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="article-full-content">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="article-hero-img"
          />
        ) : (
          <div className="article-placeholder-hero">
            <img
              src={ImageIcon}
              alt="Brak zdjęcia"
              className="article-placeholder-img"
            />
          </div>
        )}

        <div className="article-meta">
          <span className="article-full-date">{article.date}</span>
          <h1 className="article-full-title">{article.title}</h1>
        </div>

        <div className="article-body">
          <p className="article-lead">{article.excerpt}</p>

          <div className="article-content-text">{article.content}</div>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetails;
