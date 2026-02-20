import React from "react";
import "./article_details_admin.css";
import ImageIcon from "../../assets/icons/image.svg";

function ArticleDetails({ article, onClose }) {
  if (!article) return null;

  const categoryMap = {
    porady: "Porady i Edukacja",
    zdrowie: "Zdrowie i Choroby",
    suplementacja: "Suplementacja",
    styl_zycia: "Styl Życia",
  };

  const categoryLabel = categoryMap[article.category] || article.category;

  return (
    <div className="details-modal-wrapper" onClick={(e) => e.stopPropagation()}>
      <div className="details-header">
        <div className="details-header-inner">
          <h2 className="details-title">{article.title}</h2>
          <button className="article-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
      </div>

      <div className="details-full-content">
        <div className="details-content-box">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="details-hero-img"
            />
          ) : (
            <div className="details-hero-placeholder">
              <img
                src={ImageIcon}
                alt="Brak zdjęcia"
                className="placeholder-icon"
              />
            </div>
          )}

          <div className="details-meta-row">
            <span className="details-date">{article.date}</span>
            <span className="details-category-badge">{categoryLabel}</span>
          </div>

          <p className="details-lead">{article.excerpt}</p>
          <div className="details-body">{article.content}</div>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetails;
