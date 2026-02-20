import React, { useState, useRef, useEffect } from "react";
import ApiService from "../../utils/api.js";
import "./articles_admin.css";

import AddPhotoIcon from "../../assets/icons/add_a_photo.svg";
import DeleteIcon from "../../assets/icons/delete.svg";

function ArticleForm({ onArticleAdded, onClose, initialData = null }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "porady",
    label: "",
    image: "",
    excerpt: "",
    content: "",
  });

  const categories = [
    { id: "porady", label: "Porady i Edukacja" },
    { id: "zdrowie", label: "Zdrowie i Choroby" },
    { id: "suplementacja", label: "Suplementacja" },
    { id: "styl_zycia", label: "Styl Życia" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        category: initialData.category || "porady",
        label: initialData.label || "",
        image: initialData.image || "",
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
      });
    }
  }, [initialData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Zdjęcie jest za duże! Max 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        label: formData.label.trim() || "Artykuł",
      };

      let finalArticle;
      if (initialData) {
        await ApiService.updateArticle(initialData._id, payload);
        finalArticle = {
          ...payload,
          _id: initialData._id,
          date: initialData.date,
        };
      } else {
        finalArticle = await ApiService.addArticle(payload);
      }

      if (!finalArticle || !finalArticle._id) {
        if (!initialData)
          throw new Error("Błąd: Serwer nie zwrócił danych artykułu.");
      }

      onArticleAdded(finalArticle);
    } catch (err) {
      console.error(err);
      setError("Błąd zapisu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-form-container article-form-wrapper">
      <div className="article-modal-header article-form-header">
        <h2>{initialData ? "Edytuj artykuł" : "Dodaj nowy artykuł"}</h2>
        <button className="article-close-btn" onClick={onClose} type="button">
          &times;
        </button>
      </div>

      <div className="article-form-body">
        <form onSubmit={handleSubmit} className="article-form-flex">
          <div className="article-inputs-scroll-container">
            {error && <div className="error-msg">{error}</div>}

            <div className="form-group">
              <label className="form-label-styled">Zdjęcie nagłówkowe</label>
              {formData.image ? (
                <div className="image-preview-container-small">
                  <img src={formData.image} alt="Podgląd" />
                  <button
                    type="button"
                    className="remove-image-btn remove-img-btn-abs"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    title="Usuń zdjęcie"
                  >
                    <img
                      src={DeleteIcon}
                      alt="Usuń"
                      className="delete-icon-img"
                    />
                  </button>
                </div>
              ) : (
                <div
                  className="image-upload-box-small"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img
                    src={AddPhotoIcon}
                    alt="Dodaj"
                    className="upload-icon-small"
                  />
                  <span className="upload-text-small">
                    Kliknij, aby dodać zdjęcie
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden-input"
                  />
                </div>
              )}
            </div>

            <div className="article-form-grid">
              <div className="form-group">
                <label className="form-label-styled">Tytuł *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="form-input-styled"
                  placeholder="Wpisz tytuł..."
                />
              </div>

              <div className="form-group">
                <label className="form-label-styled">Kategoria</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="form-input-styled"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label-styled">Etykieta na zdjęciu</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                className="form-input-styled"
                placeholder="Tekst wyświetlany na kafelku..."
              />
            </div>

            <div className="form-group">
              <label className="form-label-styled">Wstęp *</label>
              <textarea
                rows="3"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                required
                className="form-textarea-styled"
                placeholder="Krótkie wprowadzenie..."
              />
            </div>

            <div className="form-group">
              <label className="form-label-styled">Treść główna *</label>
              <textarea
                rows="12"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
                className="form-textarea-styled"
                placeholder="Pełna treść artykułu..."
              />
            </div>
          </div>

          <div className="article-form-actions-fixed">
            <button type="button" onClick={onClose} className="btn-cancel">
              Anuluj
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? "Zapisywanie..."
                : initialData
                  ? "Zapisz zmiany"
                  : "Opublikuj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ArticleForm;
