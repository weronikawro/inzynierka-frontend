import React, { useState, useEffect } from "react";
import ApiService from "../../utils/api.js";
import ArticleDetails from "./article_details_admin.jsx";
import ArticleForm from "./article_form_admin.jsx";
import "./articles_admin.css";

import EditIcon from "../../assets/icons/edit.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import ViewIcon from "../../assets/icons/visibility.svg";
import NoImageIcon from "../../assets/icons/image.svg";

function ArticlesPage({ user }) {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  const categoryMap = {
    porady: "Porady i Edukacja",
    zdrowie: "Zdrowie i Choroby",
    suplementacja: "Suplementacja",
    styl_zycia: "Styl Życia",
  };

  const getArticleBadgeClass = (cat) => {
    if (!cat) return "badge-gray";
    const c = cat.toLowerCase();
    if (c === "zdrowie") return "badge-health";
    if (c === "porady") return "badge-tips";
    if (c === "suplementacja") return "badge-diet";
    if (c === "styl_zycia") return "badge-sugar";
    return "badge-gray";
  };

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [articles, searchQuery, selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getArticles();
      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = articles;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.authorName && a.authorName.toLowerCase().includes(q)),
      );
    }
    if (selectedCategory) {
      result = result.filter((a) => a.category === selectedCategory);
    }
    setFilteredArticles(result);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getSortedArticles = () => {
    const sorted = [...filteredArticles];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aV = a[sortConfig.key],
          bV = b[sortConfig.key];
        if (sortConfig.key === "category") {
          aV = categoryMap[a.category] || a.category;
          bV = categoryMap[b.category] || b.category;
        }
        if (!aV) aV = "";
        if (!bV) bV = "";
        if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
        if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const displayedArticles = getSortedArticles();
  const getSortIndicator = (k) =>
    sortConfig.key !== k ? null : sortConfig.direction === "asc" ? "▲" : "▼";

  const handleArticleAdded = (newArt) => {
    setArticles((p) => {
      const ex = p.find((a) => a._id === newArt._id);
      return ex
        ? p.map((a) => (a._id === newArt._id ? newArt : a))
        : [newArt, ...p];
    });
    setShowAddArticle(false);
    setArticleToEdit(null);
    alert("Zapisano artykuł.");
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Usunąć artykuł?")) return;
    try {
      await ApiService.deleteArticle(id);
      setArticles((p) => p.filter((a) => a._id !== id));
      alert("Usunięto.");
    } catch (e) {
      alert("Błąd usuwania.");
    }
  };

  return (
    <div className="admin-content-container">
      <div className="admin-page-header">
        <div>
          <h1>Zarządzanie Artykułami</h1>
          <p>Blog i porady</p>
        </div>
        <button
          className="add-btn-primary"
          onClick={() => setShowAddArticle(true)}
        >
          <span>+</span> Dodaj artykuł
        </button>
      </div>
      <div className="admin-toolbar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Szukaj artykułu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="diet-filter-wrapper">
          <select
            className="admin-search-input cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Wszystkie kategorie</option>
            {Object.entries(categoryMap).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="stats-badge">Ilość: {displayedArticles.length}</div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-indicator">Ładowanie...</div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th width="80">Obraz</th>
                <th onClick={() => handleSort("title")} className="sortable-th">
                  Tytuł {getSortIndicator("title")}
                </th>
                <th
                  onClick={() => handleSort("category")}
                  className="sortable-th"
                >
                  Kategoria {getSortIndicator("category")}
                </th>
                <th onClick={() => handleSort("label")} className="sortable-th">
                  Etykieta {getSortIndicator("label")}
                </th>
                <th onClick={() => handleSort("date")} className="sortable-th">
                  Data {getSortIndicator("date")}
                </th>
                <th className="th-actions">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {displayedArticles.length > 0 ? (
                displayedArticles.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div className="table-img-preview">
                        {a.image ? (
                          <img src={a.image} alt="mini" />
                        ) : (
                          <img
                            src={NoImageIcon}
                            alt=""
                            className="table-img-placeholder"
                          />
                        )}
                      </div>
                    </td>
                    <td className="td-title">{a.title}</td>
                    <td>
                      <span
                        className={`category-badge ${getArticleBadgeClass(a.category)}`}
                      >
                        {categoryMap[a.category] || a.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`label-text ${!a.label ? "label-italic" : ""}`}
                      >
                        {a.label || "(brak)"}
                      </span>
                    </td>
                    <td className="td-date">{a.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => setArticleToEdit(a)}
                        >
                          <img src={EditIcon} alt="E" />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteArticle(a._id)}
                        >
                          <img src={DeleteIcon} alt="D" />
                        </button>
                        <button
                          className="btn-icon btn-view"
                          onClick={() => setSelectedArticle(a)}
                        >
                          <img src={ViewIcon} alt="V" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table-message">
                    Brak wyników
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(showAddArticle || articleToEdit) && (
        <div
          className="drawer-overlay"
          onClick={() => {
            setShowAddArticle(false);
            setArticleToEdit(null);
          }}
        >
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <ArticleForm
              initialData={articleToEdit}
              onArticleAdded={handleArticleAdded}
              onClose={() => {
                setShowAddArticle(false);
                setArticleToEdit(null);
              }}
            />
          </div>
        </div>
      )}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
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
