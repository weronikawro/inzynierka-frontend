import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../utils/api.js";
import "./recipe.css";
import {
  formCategories as categories,
  availableTags,
} from "../../utils/recipe_constants.js";

import AddPhotoIcon from "../../assets/icons/add_a_photo.svg";
import DeleteIcon from "../../assets/icons/delete.svg";

function RecipeForm({ onRecipeAdded, onClose, initialData = null }) {
  const fileInputRef = useRef(null);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [activeSearchRow, setActiveSearchRow] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    ingredients: [
      {
        name: "",
        amount: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        productId: null,
        baseValues: null,
      },
    ],
    instructions: [""],
    servings: 1,
    prepTime: 0,
    cookTime: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    category: [],
    difficulty: "medium",
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await ApiService.getProducts();
        setAvailableProducts(products);
      } catch (e) {
        console.error("Błąd pobierania produktów", e);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (initialData) {
      let initialCategories = [];
      if (Array.isArray(initialData.category)) {
        initialCategories = initialData.category;
      } else if (initialData.category) {
        initialCategories = [initialData.category];
      }

      setFormData({
        ...initialData,
        image: initialData.image || "",
        prepTime: initialData.prepTime || 0,
        cookTime: initialData.cookTime || 0,
        ingredients: initialData.ingredients?.length
          ? initialData.ingredients.map((ing) => ({
              ...ing,
              amount: ing.amount !== undefined ? ing.amount : 0,
            }))
          : [
              {
                name: "",
                amount: 0,
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
              },
            ],
        instructions: initialData.instructions?.length
          ? initialData.instructions
          : [""],
        tags: initialData.tags || [],
        calories: Math.round(initialData.calories || 0),
        protein: parseFloat(Number(initialData.protein || 0).toFixed(1)),
        carbs: parseFloat(Number(initialData.carbs || 0).toFixed(1)),
        fat: parseFloat(Number(initialData.fat || 0).toFixed(1)),
        category: initialCategories,
      });
    }
  }, [initialData]);

  const calculateIngredientValues = (baseValues, amount) => {
    if (!baseValues) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const ratio = amount / 100;

    return {
      calories: Math.round(baseValues.calories * ratio),
      protein: parseFloat((baseValues.protein * ratio).toFixed(1)),
      carbs: parseFloat((baseValues.carbs * ratio).toFixed(1)),
      fat: parseFloat((baseValues.fat * ratio).toFixed(1)),
    };
  };

  const calculateTotals = (ingredients, servings) => {
    const numServings = Math.max(1, parseInt(servings) || 1);
    const totals = ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + (parseFloat(ing.calories) || 0),
        protein: acc.protein + (parseFloat(ing.protein) || 0),
        carbs: acc.carbs + (parseFloat(ing.carbs) || 0),
        fat: acc.fat + (parseFloat(ing.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    setFormData((p) => ({
      ...p,
      ingredients,
      servings: numServings,
      calories: Math.round(totals.calories / numServings),
      protein: parseFloat((totals.protein / numServings).toFixed(1)),
      carbs: parseFloat((totals.carbs / numServings).toFixed(1)),
      fat: parseFloat((totals.fat / numServings).toFixed(1)),
    }));
  };

  const handleProductSelect = (index, product) => {
    const newIngredients = [...formData.ingredients];
    const baseValues = {
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
    };

    const defaultAmount = 100;
    const calculated = calculateIngredientValues(baseValues, defaultAmount);

    newIngredients[index] = {
      ...newIngredients[index],
      name: product.name,
      productId: product._id,
      baseValues: baseValues,
      amount: defaultAmount,
      ...calculated,
    };

    setActiveSearchRow(null);
    calculateTotals(newIngredients, formData.servings);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    const currentIng = newIngredients[index];

    currentIng[field] = value;

    if (field === "name") {
      setActiveSearchRow(index);
    }

    const numericVal = parseFloat(String(value).replace(",", ".")) || 0;

    if (field !== "name" && numericVal < 0) return;

    if (field === "amount" && currentIng.baseValues) {
      const calculated = calculateIngredientValues(
        currentIng.baseValues,
        numericVal,
      );
      currentIng.calories = calculated.calories;
      currentIng.protein = calculated.protein;
      currentIng.carbs = calculated.carbs;
      currentIng.fat = calculated.fat;
    }

    newIngredients[index] = currentIng;
    calculateTotals(newIngredients, formData.servings);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          const finalWidth = scaleSize < 1 ? MAX_WIDTH : img.width;
          const finalHeight =
            scaleSize < 1 ? img.height * scaleSize : img.height;

          canvas.width = finalWidth;
          canvas.height = finalHeight;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
          setFormData((p) => ({ ...p, image: compressedDataUrl }));
        };
      };
    }
  };
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && value < 0) return;
    if (name === "servings") calculateTotals(formData.ingredients, value);
    else setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCategoryToggle = (catValue) => {
    setFormData((prev) => {
      const currentCats = prev.category;
      if (currentCats.includes(catValue)) {
        return { ...prev, category: currentCats.filter((c) => c !== catValue) };
      } else {
        return { ...prev, category: [...currentCats, catValue] };
      }
    });
  };

  const addIngredient = () =>
    setFormData((p) => ({
      ...p,
      ingredients: [
        ...p.ingredients,
        { name: "", amount: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
      ],
    }));

  const removeIngredient = (idx) => {
    if (formData.ingredients.length > 1) {
      const filtered = formData.ingredients.filter((_, i) => i !== idx);
      calculateTotals(filtered, formData.servings);
    } else {
      alert("Przepis musi zawierać przynajmniej jeden składnik!");
    }
  };

  const handleInstructionChange = (idx, val) => {
    const newInst = [...formData.instructions];
    newInst[idx] = val;
    setFormData((p) => ({ ...p, instructions: newInst }));
  };

  const handleTagToggle = (tagId) => {
    setFormData((p) => ({
      ...p,
      tags: p.tags.includes(tagId)
        ? p.tags.filter((t) => t !== tagId)
        : [...p.tags, tagId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = {
        ...formData,
        instructions: formData.instructions.filter((i) => i.trim()),
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0,
        servings: parseInt(formData.servings) || 1,
        calories: Math.round(formData.calories || 0),
        protein: parseFloat(Number(formData.protein || 0).toFixed(1)),
        carbs: parseFloat(Number(formData.carbs || 0).toFixed(1)),
        fat: parseFloat(Number(formData.fat || 0).toFixed(1)),
      };
      let res;
      if (initialData) {
        const response = await ApiService.updateRecipe(initialData._id, data);
        res = response.recipe;
        alert("Przepis zaktualizowany!");
      } else {
        const response = await ApiService.addRecipe(data);
        res = response;
        alert("Przepis dodany!");
      }

      onRecipeAdded(res || { ...data, _id: Date.now() });
    } catch (err) {
      console.error(err);
      setError("Błąd zapisu");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = (query) => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return availableProducts
      .filter((p) => p.name.toLowerCase().includes(lower))
      .slice(0, 5);
  };

  return (
    <div className="recipe-form-container">
      <div className="recipe-form-header">
        <h2>{initialData ? "Edytuj" : "Dodaj"}</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      {error && <div className="error-text">{error}</div>}

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label>Zdjęcie</label>
          {formData.image ? (
            <div className="image-preview-container">
              <img src={formData.image} alt="" className="preview-img-full" />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => setFormData((p) => ({ ...p, image: "" }))}
              >
                <img src={DeleteIcon} alt="X" />
              </button>
            </div>
          ) : (
            <div
              className="image-upload-box"
              onClick={() => fileInputRef.current.click()}
            >
              <img src={AddPhotoIcon} className="add-photo-icon" alt="+" />
              <span className="upload-text">Dodaj zdjęcie</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden-input"
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Nazwa *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Opis</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            rows="2"
          />
        </div>

        <div className="form-group tags-section">
          <label>Kategorie</label>
          <div className="tags-grid">
            {categories.map((cat) => (
              <label key={cat.value} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={formData.category.includes(cat.value)}
                  onChange={() => handleCategoryToggle(cat.value)}
                />
                <span className="tag-label">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Liczba porcji *</label>
            <input
              name="servings"
              type="number"
              min="1"
              value={formData.servings || ""}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Poziom trudności</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="easy">Łatwy</option>
              <option value="medium">Średni</option>
              <option value="hard">Trudny</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Czas przygotowania (min)</label>
            <input
              name="prepTime"
              type="number"
              min="0"
              placeholder="np. 15"
              value={formData.prepTime || ""}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Czas gotowania (min)</label>
            <input
              name="cookTime"
              type="number"
              min="0"
              placeholder="np. 45"
              value={formData.cookTime || ""}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group ingredients-section-complex">
          <label>Składniki</label>
          <div className="ingredients-header-row">
            <span className="col-name">Nazwa produktu</span>
            <span className="col-val">Ilość (g)</span>
            <span className="col-val">Kcal</span>
            <span className="col-val">B</span>
            <span className="col-val">W</span>
            <span className="col-val">T</span>
            <span></span>
          </div>

          {formData.ingredients.map((ing, idx) => (
            <div key={idx} className="ingredient-row-complex">
              <div className="ing-name-wrapper">
                <input
                  value={ing.name}
                  onChange={(e) =>
                    handleIngredientChange(idx, "name", e.target.value)
                  }
                  onFocus={() => setActiveSearchRow(idx)}
                  onBlur={() => setTimeout(() => setActiveSearchRow(null), 200)}
                  className="form-input ing-name"
                  placeholder="Wyszukaj..."
                  required
                />
                {activeSearchRow === idx && ing.name.length > 1 && (
                  <ul className="suggestions-list">
                    {getFilteredProducts(ing.name).map((product) => (
                      <li
                        key={product._id}
                        className="suggestion-item"
                        onMouseDown={() => handleProductSelect(idx, product)}
                      >
                        <span>{product.name}</span>
                        <span className="suggestion-meta">
                          {product.calories} kcal/100g
                        </span>
                      </li>
                    ))}
                    {getFilteredProducts(ing.name).length === 0 && (
                      <li className="suggestion-item suggestion-item-empty">
                        Brak w bazie
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <input
                type="number"
                min="0"
                step="0.1"
                value={ing.amount || ""}
                onChange={(e) =>
                  handleIngredientChange(idx, "amount", e.target.value)
                }
                className="form-input ing-val ing-amount-highlight"
                placeholder="g"
              />

              <input
                type="number"
                min="0"
                step="1"
                value={ing.calories || ""}
                onChange={(e) =>
                  handleIngredientChange(idx, "calories", e.target.value)
                }
                className="form-input ing-val"
                placeholder="0"
              />

              <input
                type="number"
                min="0"
                step="0.1"
                value={ing.protein || ""}
                onChange={(e) =>
                  handleIngredientChange(idx, "protein", e.target.value)
                }
                className="form-input ing-val"
                placeholder="0"
              />

              <input
                type="number"
                min="0"
                step="0.1"
                value={ing.carbs || ""}
                onChange={(e) =>
                  handleIngredientChange(idx, "carbs", e.target.value)
                }
                className="form-input ing-val"
                placeholder="0"
              />

              <input
                type="number"
                min="0"
                step="0.1"
                value={ing.fat || ""}
                onChange={(e) =>
                  handleIngredientChange(idx, "fat", e.target.value)
                }
                className="form-input ing-val"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="remove-ingredient-btn"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="add-ingredient-btn-complex"
          >
            + Dodaj składnik
          </button>
        </div>

        <div className="nutrition-summary-box">
          <h4>Wartości na 1 porcję:</h4>
          <div className="nutrition-summary-grid">
            <div>
              <strong>{formData.calories}</strong> kcal
            </div>
            <div>
              B: <strong>{formData.protein}g</strong>
            </div>
            <div>
              W: <strong>{formData.carbs}g</strong>
            </div>
            <div>
              T: <strong>{formData.fat}g</strong>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Sposób przygotowania</label>
          {formData.instructions.map((inst, idx) => (
            <div key={idx} className="instruction-item-row">
              <span className="inst-number">{idx + 1}.</span>
              <textarea
                value={inst}
                onChange={(e) => handleInstructionChange(idx, e.target.value)}
                className="form-textarea"
                placeholder={`Krok ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => {
                  const f = formData.instructions.filter((_, i) => i !== idx);
                  setFormData((p) => ({ ...p, instructions: f }));
                }}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData((p) => ({
                ...p,
                instructions: [...p.instructions, ""],
              }))
            }
            className="add-btn"
          >
            + Dodaj krok
          </button>
        </div>

        <div className="form-group tags-section">
          <label>Tagi dietetyczne</label>
          <div className="tags-grid">
            {availableTags.map((tag) => (
              <label key={tag} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={formData.tags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                />
                <span className="tag-label">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Anuluj
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Zapisywanie..." : "Zapisz"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;
