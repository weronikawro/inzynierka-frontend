import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../utils/api.js";
import "./recipe_admin.css";
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
        category: initialCategories,
        calories: Math.round(initialData.calories || 0),
        protein: parseFloat(Number(initialData.protein || 0).toFixed(1)),
        carbs: parseFloat(Number(initialData.carbs || 0).toFixed(1)),
        fat: parseFloat(Number(initialData.fat || 0).toFixed(1)),
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

    setFormData((prev) => ({
      ...prev,
      ingredients,
      servings: numServings,
      calories: Math.round(totals.calories / numServings),
      protein: parseFloat((totals.protein / numServings).toFixed(1)),
      carbs: parseFloat((totals.carbs / numServings).toFixed(1)),
      fat: parseFloat((totals.fat / numServings).toFixed(1)),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && value < 0) return;
    if (name === "servings") {
      calculateTotals(formData.ingredients, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Zdjęcie jest za duże! Maksymalny rozmiar to 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    let val = value;

    if (field === "name") {
      setActiveSearchRow(index);
    }
    if (field !== "name") {
      val = val === "" ? 0 : parseFloat(val);
      if (val < 0) return;
    }

    currentIng[field] = val;

    if (field === "amount" && currentIng.baseValues) {
      const calculated = calculateIngredientValues(currentIng.baseValues, val);
      currentIng.calories = calculated.calories;
      currentIng.protein = calculated.protein;
      currentIng.carbs = calculated.carbs;
      currentIng.fat = calculated.fat;
    }

    newIngredients[index] = currentIng;
    calculateTotals(newIngredients, formData.servings);
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { name: "", amount: 0, calories: 0, protein: 0, carbs: 0, fat: 0 },
      ],
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      calculateTotals(newIngredients, formData.servings);
    }
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData((prev) => ({ ...prev, instructions: newInstructions }));
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const recipeData = {
        ...formData,
        instructions: formData.instructions.filter((inst) => inst.trim()),
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0,
        calories: Math.round(formData.calories),
        protein: parseFloat(Number(formData.protein).toFixed(1)),
        carbs: parseFloat(Number(formData.carbs).toFixed(1)),
        fat: parseFloat(Number(formData.fat).toFixed(1)),
      };

      let finalRecipe;

      if (initialData) {
        await ApiService.updateRecipe(initialData._id, recipeData);
        finalRecipe = {
          ...recipeData,
          _id: initialData._id,
          createdAt: initialData.createdAt,
          authorName: initialData.authorName,
        };
      } else {
        const response = await ApiService.addRecipe(recipeData);
        finalRecipe = response.recipe || response;
      }

      if (!finalRecipe || !finalRecipe._id) {
        throw new Error(
          "Serwer nie zwrócił poprawnego identyfikatora przepisu.",
        );
      }

      onRecipeAdded(finalRecipe);
    } catch (err) {
      console.error("Błąd w RecipeForm:", err);
      setError("Błąd zapisu: " + err.message);
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
        <h2>{initialData ? "Edytuj przepis" : "Dodaj nowy przepis"}</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      {error && <div className="error-text">{error}</div>}

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label>Zdjęcie przepisu</label>
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
                onClick={handleRemoveImage}
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
              <span className="upload-text">Kliknij, aby dodać zdjęcie</span>
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

        <div className="form-group">
          <label>Nazwa przepisu *</label>
          <input
            name="name"
            type="text"
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

          {formData.ingredients.map((ing, index) => (
            <div key={index} className="ingredient-card">
              <div className="ingredient-card-top">
                <div className="ing-name-wrapper">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    onFocus={() => setActiveSearchRow(index)}
                    onBlur={() =>
                      setTimeout(() => setActiveSearchRow(null), 200)
                    }
                    className="form-input"
                    placeholder="Wyszukaj..."
                    required
                  />
                  {activeSearchRow === index && ing.name.length > 1 && (
                    <ul className="suggestions-list">
                      {getFilteredProducts(ing.name).map((product) => (
                        <li
                          key={product._id}
                          className="suggestion-item"
                          onMouseDown={() =>
                            handleProductSelect(index, product)
                          }
                        >
                          <span className="suggestion-name">
                            {product.name}
                          </span>
                          <span className="suggestion-meta">
                            {product.calories} kcal/100g
                          </span>
                        </li>
                      ))}
                      {getFilteredProducts(ing.name).length === 0 && (
                        <li className="suggestion-item suggestion-empty">
                          Brak w bazie (wpisz ręcznie)
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="ingredient-card-bottom">
                <div className="ing-field-group ing-amount-group">
                  <label className="ing-label-small">ILOŚĆ (G)</label>
                  <input
                    type="number"
                    min="0"
                    value={ing.amount || ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "amount", e.target.value)
                    }
                    className="form-input ing-input-num"
                    placeholder="g"
                  />
                </div>

                <div className="ing-field-group">
                  <label className="ing-label-small">KCAL</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={ing.calories || ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "calories", e.target.value)
                    }
                    className="form-input ing-input-num"
                    placeholder="0"
                  />
                </div>

                <div className="ing-field-group">
                  <label className="ing-label-small">B</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ing.protein || ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "protein", e.target.value)
                    }
                    className="form-input ing-input-num"
                    placeholder="0"
                  />
                </div>

                <div className="ing-field-group">
                  <label className="ing-label-small">W</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ing.carbs || ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "carbs", e.target.value)
                    }
                    className="form-input ing-input-num"
                    placeholder="0"
                  />
                </div>

                <div className="ing-field-group">
                  <label className="ing-label-small">T</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ing.fat || ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "fat", e.target.value)
                    }
                    className="form-input ing-input-num"
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="btn-remove-ing-card"
                  title="Usuń składnik"
                >
                  ×
                </button>
              </div>
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
              <span>Kcal</span>
              <strong>{formData.calories}</strong>
            </div>
            <div>
              <span>Białko</span>
              <strong>{formData.protein}g</strong>
            </div>
            <div>
              <span>Węglowodany</span>
              <strong>{formData.carbs}g</strong>
            </div>
            <div>
              <span>Tłuszcze</span>
              <strong>{formData.fat}g</strong>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Sposób przygotowania</label>
          {formData.instructions.map((inst, index) => (
            <div key={index} className="instruction-item-row">
              <span className="inst-number">{index + 1}.</span>
              <textarea
                value={inst}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                className="form-textarea"
                placeholder={`Krok ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => {
                  const filtered = formData.instructions.filter(
                    (_, i) => i !== index,
                  );
                  setFormData({ ...formData, instructions: filtered });
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
              setFormData({
                ...formData,
                instructions: [...formData.instructions, ""],
              })
            }
            className="add-btn"
          >
            + Dodaj krok
          </button>
        </div>

        <div className="form-group tags-section">
          <label>Wybierz dietę (Tagi)</label>
          <div className="tags-grid">
            {availableTags.map((tag) => (
              <label key={tag.id} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={formData.tags.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                />
                <span className="tag-label">{tag.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Anuluj
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading
              ? "Zapisywanie..."
              : initialData
                ? "Zapisz zmiany"
                : "Dodaj przepis"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;
