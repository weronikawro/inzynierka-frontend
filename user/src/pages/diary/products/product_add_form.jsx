import React, { useState, useEffect } from "react";
import ApiService from "../../../utils/api";

function ProductAddForm({ onProductAdded, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    unit: "g",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        calories: initialData.calories,
        protein: initialData.protein,
        carbs: initialData.carbs,
        fat: initialData.fat,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        calories: Math.round(parseFloat(formData.calories) || 0),
        protein: parseFloat(Number(formData.protein).toFixed(1)) || 0,
        carbs: parseFloat(Number(formData.carbs).toFixed(1)) || 0,
        fat: parseFloat(Number(formData.fat).toFixed(1)) || 0,
      };

      let response;
      if (initialData) {
        response = await ApiService.updateProduct(initialData._id, payload);
      } else {
        response = await ApiService.addProduct(payload);
      }

      onProductAdded(response.product || response);
    } catch (error) {
      alert("Błąd zapisu produktu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-form-embedded">
      <form onSubmit={handleSubmit} className="custom-meal-form">
        <div className="modal-scroll-area">
          <div className="form-group">
            <label>Nazwa</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Kcal</label>
              <input
                type="number"
                min="0"
                step="1"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Białko</label>
              <input
                type="number"
                min="0"
                step="0.1"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Węgle</label>
              <input
                type="number"
                min="0"
                step="0.1"
                name="carbs"
                value={formData.carbs}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Tłuszcz</label>
              <input
                type="number"
                min="0"
                step="0.1"
                name="fat"
                value={formData.fat}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>
        <div className="form-actions sticky-footer">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Anuluj
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductAddForm;
