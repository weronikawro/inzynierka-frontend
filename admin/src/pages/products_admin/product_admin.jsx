import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../utils/api.js";
import "./product_admin.css";
import AddPhotoIcon from "../../assets/icons/add_a_photo.svg";
import DeleteIcon from "../../assets/icons/delete.svg";

function ProductForm({ onProductSaved, onClose, initialData = null }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    unit: "g",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const categories = [
    { value: "vegetables", label: "Warzywa" },
    { value: "fruits", label: "Owoce" },
    { value: "dairy", label: "Nabiał" },
    { value: "meat", label: "Mięso i Ryby" },
    { value: "grains", label: "Zbożowe" },
    { value: "fats", label: "Tłuszcze" },
    { value: "spices", label: "Przyprawy" },
    { value: "drinks", label: "Napoje" },
    { value: "other", label: "Inne" },
  ];

  const units = [
    { value: "g", label: "Gramy (g)" },
    { value: "ml", label: "Mililitry (ml)" },
    { value: "szt", label: "Sztuki" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "other",
        unit: initialData.unit || "g",
        calories:
          initialData.calories !== undefined
            ? Math.round(initialData.calories)
            : 0,
        protein:
          initialData.protein !== undefined
            ? parseFloat(Number(initialData.protein).toFixed(1))
            : 0,
        carbs:
          initialData.carbs !== undefined
            ? parseFloat(Number(initialData.carbs).toFixed(1))
            : 0,
        fat:
          initialData.fat !== undefined
            ? parseFloat(Number(initialData.fat).toFixed(1))
            : 0,
        image: initialData.image || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    if (type === "number") {
      if (value === "") {
        finalValue = "";
      } else {
        finalValue = parseFloat(value);
        if (isNaN(finalValue) || finalValue < 0) finalValue = 0;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleFocus = (e) => {
    const { name, value } = e.target;
    if (parseFloat(value) === 0) {
      setFormData((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: 0 }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Plik za duży (max 2MB)");
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
    setGlobalError("");

    try {
      const payload = {
        ...formData,
        calories: formData.calories === "" ? 0 : Math.round(formData.calories),
        protein:
          formData.protein === ""
            ? 0
            : parseFloat(Number(formData.protein).toFixed(1)),
        carbs:
          formData.carbs === ""
            ? 0
            : parseFloat(Number(formData.carbs).toFixed(1)),
        fat:
          formData.fat === "" ? 0 : parseFloat(Number(formData.fat).toFixed(1)),
      };

      let savedProduct;
      if (initialData) {
        await ApiService.updateProduct(initialData._id, payload);
        savedProduct = { ...payload, _id: initialData._id };
      } else {
        savedProduct = await ApiService.addProduct(payload);
      }

      if (!savedProduct || !savedProduct._id) {
        throw new Error("Serwer nie zwrócił poprawnego produktu.");
      }

      onProductSaved(savedProduct);
    } catch (err) {
      console.error(err);
      setGlobalError(err.message || "Błąd zapisu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <div className="product-form-header">
        <h2>{initialData ? "Edycja Produktu" : "Nowy Produkt"}</h2>
        <button className="product-close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="product-form-body">
        <form onSubmit={handleSubmit} className="product-form-flex">
          <div className="product-inputs-scroll-container">
            {globalError && (
              <div className="error-text-global">{globalError}</div>
            )}

            <div className="form-group">
              <label>Zdjęcie produktu</label>
              {formData.image ? (
                <div className="image-preview-container">
                  <img
                    src={formData.image}
                    alt="Podgląd"
                    className="preview-img-full"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((p) => ({ ...p, image: "" }));
                    }}
                    title="Usuń zdjęcie"
                  >
                    <img src={DeleteIcon} alt="Usuń" className="icon-svg" />
                  </button>
                </div>
              ) : (
                <div
                  className="image-upload-box"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img
                    src={AddPhotoIcon}
                    alt="Dodaj"
                    className="upload-icon-large"
                  />
                  <span className="upload-text">
                    Kliknij, aby dodać zdjęcie
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden-file-input"
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Nazwa produktu *</label>
              <input
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="np. Banan"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kategoria</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Jednostka</label>
                <select
                  name="unit"
                  className="form-select"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  {units.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="macro-box">
              <h4>Wartości odżywcze (na 100{formData.unit})</h4>

              <div className="form-group">
                <label>Kalorie (kcal)</label>
                <input
                  type="number"
                  name="calories"
                  step="1"
                  className="form-input"
                  value={formData.calories}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="macro-grid">
                <div className="form-group">
                  <label>Białko (g)</label>
                  <input
                    type="number"
                    name="protein"
                    step="0.1"
                    className="form-input"
                    value={formData.protein}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Węglowodany (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    step="0.1"
                    className="form-input"
                    value={formData.carbs}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Tłuszcze (g)</label>
                  <input
                    type="number"
                    name="fat"
                    step="0.1"
                    className="form-input"
                    value={formData.fat}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="product-form-actions-fixed">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Anuluj
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Zapisywanie..." : "Zapisz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
