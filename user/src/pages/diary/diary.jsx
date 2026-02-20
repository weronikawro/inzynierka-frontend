import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../utils/api.js";
import "./diary.css";
import {
  formCategories as mealTypes,
  dietOptions,
} from "../../utils/recipe_constants.js";
import ProductsModal from "./products/products_modal";

import ImageIcon from "../../assets/icons/image.svg";
import MenuIcon from "../../assets/icons/menu.svg";
import AddIcon from "../../assets/icons/add.svg";
import EditIcon from "../../assets/icons/edit.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import ProductsIcon from "../../assets/icons/produkty.svg";

function DiaryPage({ user }) {
  const dateInputRef = useRef(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);

  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [activeSearchRow, setActiveSearchRow] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  const [editingEntry, setEditingEntry] = useState(null);
  const [customizingRecipe, setCustomizingRecipe] = useState(null);
  const [mealTypeForCustomizing, setMealTypeForCustomizing] =
    useState("breakfast");

  const initialMealFormState = {
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    mealType: "breakfast",
    portion: 1,
  };
  const [mealForm, setMealForm] = useState(initialMealFormState);

  const formatKcal = (val) => Math.round(parseFloat(val) || 0);
  const formatMacro = (val) => (parseFloat(val) || 0).toFixed(1);

  useEffect(() => {
    if (
      showAddMeal ||
      showRecipeModal ||
      customizingRecipe ||
      editingEntry ||
      showProductsModal
    ) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [
    showAddMeal,
    showRecipeModal,
    customizingRecipe,
    editingEntry,
    showProductsModal,
  ]);

  useEffect(() => {
    if (user) {
      loadDiaryEntries();
      loadRecipes();
      loadProducts();
    }
  }, [user, selectedDate]);

  useEffect(() => {
    filterRecipes();
  }, [availableRecipes, searchQuery, selectedDiet]);

  const loadDiaryEntries = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getDiaryEntries(selectedDate);
      setDiaryEntries(data);
    } catch (error) {
      setError("Błąd podczas ładowania dziennika");
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      const data = await ApiService.getRecipes();
      setAvailableRecipes(data);
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await ApiService.getProducts();
      setAvailableProducts(data);
    } catch (e) {
      console.error("Error loading products:", e);
    }
  };

  const calculateIngredientValues = (baseValues, amount) => {
    if (!baseValues) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const ratio = amount / 100;
    return {
      calories: baseValues.calories * ratio,
      protein: baseValues.protein * ratio,
      carbs: baseValues.carbs * ratio,
      fat: baseValues.fat * ratio,
    };
  };

  const handleProductSelectForDiary = (index, product, mode) => {
    const targetState =
      mode === "customizing" ? customizingRecipe : editingEntry;
    const items = [...(targetState.ingredients || targetState.tempIngredients)];

    const baseValues = {
      calories: parseFloat(product.calories),
      protein: parseFloat(product.protein),
      carbs: parseFloat(product.carbs),
      fat: parseFloat(product.fat),
    };
    const defaultAmount = 100;
    const calculated = calculateIngredientValues(baseValues, defaultAmount);

    items[index] = {
      ...items[index],
      name: product.name,
      productId: product._id,
      baseValues: baseValues,
      amount: defaultAmount,
      ...calculated,
    };

    if (mode === "customizing") {
      setCustomizingRecipe({ ...customizingRecipe, tempIngredients: items });
    } else {
      setEditingEntry({ ...editingEntry, ingredients: items });
    }
    setActiveSearchRow(null);
  };

  const getFilteredProducts = (query) => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return availableProducts
      .filter((p) => p.name.toLowerCase().includes(lower))
      .slice(0, 5);
  };

  const handleEditIngredientInModal = (idx, field, value) => {
    const updatedIngredients = [...editingEntry.ingredients];
    const currentIng = updatedIngredients[idx];
    let val = value;

    if (field === "name") {
      setActiveSearchRow(idx);
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

    setEditingEntry({ ...editingEntry, ingredients: updatedIngredients });
  };

  const handleEditCustomizingIngredient = (idx, field, value) => {
    const updated = [...customizingRecipe.tempIngredients];
    const currentIng = updated[idx];
    let val = value;

    if (field === "name") {
      setActiveSearchRow(idx);
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

    setCustomizingRecipe({ ...customizingRecipe, tempIngredients: updated });
  };

  const handleAddIngredientInModal = () => {
    const newIngredient = {
      name: "",
      amount: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    };
    setEditingEntry({
      ...editingEntry,
      ingredients: [...(editingEntry.ingredients || []), newIngredient],
    });
  };

  const handleAddCustomizingIngredient = () => {
    const newIng = {
      name: "",
      amount: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    };
    setCustomizingRecipe({
      ...customizingRecipe,
      tempIngredients: [...customizingRecipe.tempIngredients, newIng],
    });
  };

  const filterRecipes = () => {
    let result = availableRecipes;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((recipe) =>
        recipe.name.toLowerCase().includes(query),
      );
    }
    if (selectedDiet) {
      result = result.filter((r) => r.tags && r.tags.includes(selectedDiet));
    }
    setFilteredRecipes(result);
  };

  const getDateLabel = (dateStr) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    if (dateStr === today) return "Dzisiaj";
    if (dateStr === yesterday) return "Wczoraj";
    return dateStr;
  };

  const shiftDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && value < 0) return;
    setMealForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseAddMeal = () => {
    setShowAddMeal(false);
    setMealForm(initialMealFormState);
  };

  const handleAddCustomMeal = async (e) => {
    e.preventDefault();
    if (!mealForm.name.trim()) {
      setError("Nazwa posiłku jest wymagana");
      return;
    }
    setLoading(true);
    try {
      const mealData = {
        ...mealForm,
        date: selectedDate,
        calories: parseFloat(mealForm.calories) || 0,
        protein: parseFloat(mealForm.protein) || 0,
        carbs: parseFloat(mealForm.carbs) || 0,
        fat: parseFloat(mealForm.fat) || 0,
        portion: parseFloat(mealForm.portion) || 1,
        type: "custom",
      };
      await ApiService.addDiaryEntry(mealData);
      await loadDiaryEntries();
      handleCloseAddMeal();
      setError("");
    } catch (error) {
      setError("Błąd podczas dodawania posiłku");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipeToMeal = async (recipe, mealType) => {
    setLoading(true);
    try {
      const mealData = {
        name: recipe.name,
        date: selectedDate,
        mealType: mealType,
        calories: parseFloat(recipe.calories) || 0,
        protein: parseFloat(recipe.protein) || 0,
        carbs: parseFloat(recipe.carbs) || 0,
        fat: parseFloat(recipe.fat) || 0,
        type: "recipe",
        recipeId: recipe._id,
        ingredients: recipe.ingredients || [],
        image: recipe.image,
      };
      await ApiService.addDiaryEntry(mealData);
      await loadDiaryEntries();
      setShowRecipeModal(false);
    } catch (error) {
      setError("Błąd podczas dodawania przepisu");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCustomizing = (recipe, mealType) => {
    setCustomizingRecipe({
      ...recipe,
      tempIngredients: Array.isArray(recipe.ingredients)
        ? JSON.parse(JSON.stringify(recipe.ingredients))
        : [],
    });
    setMealTypeForCustomizing(mealType);
    setShowRecipeModal(false);
  };

  const confirmCustomizedRecipe = async () => {
    setLoading(true);
    try {
      const totals = customizingRecipe.tempIngredients.reduce(
        (acc, ing) => ({
          calories: acc.calories + (parseFloat(ing.calories) || 0),
          protein: acc.protein + (parseFloat(ing.protein) || 0),
          carbs: acc.carbs + (parseFloat(ing.carbs) || 0),
          fat: acc.fat + (parseFloat(ing.fat) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );

      const diaryData = {
        name: customizingRecipe.name,
        date: selectedDate,
        mealType: mealTypeForCustomizing,
        ...totals,
        ingredients: customizingRecipe.tempIngredients,
        type: "recipe",
        recipeId: customizingRecipe._id,
        image: customizingRecipe.image,
      };

      await ApiService.addDiaryEntry(diaryData);
      await loadDiaryEntries();
      setCustomizingRecipe(null);
    } catch (err) {
      setError("Błąd zapisu dostosowanego przepisu");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rawId = editingEntry._id || "";
      const cleanId = rawId.toString().includes(":")
        ? rawId.toString().split(":")[0]
        : rawId;
      let updatedData = {
        ...editingEntry,
        calories: Math.round(parseFloat(editingEntry.calories) || 0),
        protein: parseFloat(editingEntry.protein) || 0,
        carbs: parseFloat(editingEntry.carbs) || 0,
        fat: parseFloat(editingEntry.fat) || 0,
      };

      if (editingEntry.type === "recipe" && editingEntry.ingredients) {
        const totals = editingEntry.ingredients.reduce(
          (acc, ing) => ({
            calories: acc.calories + (parseFloat(ing.calories) || 0),
            protein: acc.protein + (parseFloat(ing.protein) || 0),
            carbs: acc.carbs + (parseFloat(ing.carbs) || 0),
            fat: acc.fat + (parseFloat(ing.fat) || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 },
        );
        updatedData = {
          ...updatedData,
          ...totals,
          calories: Math.round(totals.calories),
        };
      }

      await ApiService.updateDiaryEntry(cleanId, updatedData);

      await loadDiaryEntries();
      setEditingEntry(null);
      setError("");
    } catch (err) {
      console.error("Błąd aktualizacji:", err);
      setError("Błąd aktualizacji wpisu");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten wpis?")) return;
    try {
      const cleanId = entryId.toString().includes(":")
        ? entryId.toString().split(":")[0]
        : entryId;

      await ApiService.deleteDiaryEntry(cleanId);
      await loadDiaryEntries();
    } catch (error) {
      setError("Błąd usuwania");
    }
  };

  const dailyTotals = diaryEntries.reduce(
    (acc, curr) => ({
      calories: acc.calories + (parseFloat(curr.calories) || 0),
      protein: acc.protein + (parseFloat(curr.protein) || 0),
      carbs: acc.carbs + (parseFloat(curr.carbs) || 0),
      fat: acc.fat + (parseFloat(curr.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const groupedEntries = diaryEntries.reduce((groups, entry) => {
    const mealType = entry.mealType || "snack";
    if (!groups[mealType]) groups[mealType] = [];
    groups[mealType].push(entry);
    return groups;
  }, {});

  if (!user) return <div className="content-container"></div>;

  const dailyTarget = user.bmiData?.tdee || 2000;
  const proteinTarget = user.bmiData?.protein || 150;
  const carbsTarget = user.bmiData?.carbs || 250;
  const fatTarget = user.bmiData?.fat || 70;

  return (
    <div className="content-container">
      {error && <div className="error-message">{error}</div>}

      <div className="diary-full-layout">
        <div className="daily-summary-header">
          <div className="kcal-status-block">
            <span className="calorie-label">Kalorie</span>
            <div className="kcal-status">
              <span
                className={`current-kcal ${dailyTotals.calories > dailyTarget ? "exceeded" : "within-limit"}`}
              >
                {formatKcal(dailyTotals.calories)}
              </span>
              <span className="total-target">
                / {formatKcal(dailyTarget)} kcal
              </span>
            </div>
          </div>
          <div className="main-progress-bar">
            <div
              className={`main-progress-fill ${dailyTotals.calories > dailyTarget ? "bg-exceeded" : "bg-within-limit"}`}
              style={{
                width: `${Math.min((dailyTotals.calories / dailyTarget) * 100, 100)}%`,
              }}
            ></div>
          </div>

          <div className="macros-status-row">
            <div className="macro-stat">
              <span className="macro-label">Białko</span>
              <div className="macro-val-container">
                <span
                  className={`macro-current ${dailyTotals.protein > proteinTarget ? "exceeded" : ""}`}
                >
                  {formatMacro(dailyTotals.protein)}g
                </span>
                <span className="macro-target">/ {proteinTarget}g</span>
              </div>
              <div className="macro-mini-bar">
                <div
                  className={`macro-mini-fill ${dailyTotals.protein > proteinTarget ? "bg-exceeded" : "bg-within-limit"}`}
                  style={{
                    width: `${Math.min((dailyTotals.protein / proteinTarget) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="macro-stat">
              <span className="macro-label">Węglowodany</span>
              <div className="macro-val-container">
                <span
                  className={`macro-current ${dailyTotals.carbs > carbsTarget ? "exceeded" : ""}`}
                >
                  {formatMacro(dailyTotals.carbs)}g
                </span>
                <span className="macro-target">/ {carbsTarget}g</span>
              </div>
              <div className="macro-mini-bar">
                <div
                  className={`macro-mini-fill ${dailyTotals.carbs > carbsTarget ? "bg-exceeded" : "bg-within-limit"}`}
                  style={{
                    width: `${Math.min((dailyTotals.carbs / carbsTarget) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="macro-stat">
              <span className="macro-label">Tłuszcze</span>
              <div className="macro-val-container">
                <span
                  className={`macro-current ${dailyTotals.fat > fatTarget ? "exceeded" : ""}`}
                >
                  {formatMacro(dailyTotals.fat)}g
                </span>
                <span className="macro-target">/ {fatTarget}g</span>
              </div>
              <div className="macro-mini-bar">
                <div
                  className={`macro-mini-fill ${dailyTotals.fat > fatTarget ? "bg-exceeded" : "bg-within-limit"}`}
                  style={{
                    width: `${Math.min((dailyTotals.fat / fatTarget) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="diary-controls-row">
          <div className="custom-date-navigator">
            <button className="nav-arrow" onClick={() => shiftDate(-1)}>
              ‹
            </button>
            <div
              className="date-display-container"
              onClick={() => dateInputRef.current.showPicker()}
            >
              <span className="date-label">
                {getDateLabel(selectedDate)}{" "}
                <span className="date-dropdown-arrow">▼</span>
              </span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="hidden-date-input"
              />
            </div>
            <button className="nav-arrow" onClick={() => shiftDate(1)}>
              ›
            </button>
          </div>

          <div className="controls-right-group">
            <button
              className="btn-new-custom"
              onClick={() => setShowAddMeal(true)}
            >
              <span className="btn-icon">+</span> Dodaj własny posiłek
            </button>
            <button
              className="btn-new-db"
              onClick={() => setShowRecipeModal(true)}
            >
              <img src={MenuIcon} alt="" className="btn-icon-svg" />
              Dodaj z bazy
            </button>

            <button
              className="btn-new-db"
              onClick={() => setShowProductsModal(true)}
            >
              <img src={ProductsIcon} alt="" className="btn-icon-svg" />
              Produkty
            </button>
          </div>
        </div>

        <div className="diary-entries-list">
          {mealTypes.map((mealType) => (
            <div key={mealType.value} className="meal-group">
              <div className="meal-group-header">
                <h3>{mealType.label}</h3>
                <button
                  className="plus-add-btn"
                  onClick={() => {
                    setMealForm((p) => ({ ...p, mealType: mealType.value }));
                    setShowAddMeal(true);
                  }}
                >
                  +
                </button>
              </div>
              <div className="meal-group-content">
                {groupedEntries[mealType.value] &&
                groupedEntries[mealType.value].length > 0 ? (
                  groupedEntries[mealType.value].map((entry) => (
                    <EntryItem
                      key={entry._id}
                      entry={entry}
                      onEdit={setEditingEntry}
                      onDelete={handleDeleteEntry}
                      formatKcal={formatKcal}
                      formatMacro={formatMacro}
                    />
                  ))
                ) : (
                  <div className="entry-none">Jeszcze nic nie zjedzono</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddMeal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Dodaj własny posiłek</h2>
              <button className="close-btn" onClick={handleCloseAddMeal}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddCustomMeal} className="custom-meal-form">
              <div className="modal-scroll-area">
                <div className="form-group">
                  <label>Nazwa posiłku *</label>
                  <input
                    name="name"
                    value={mealForm.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Kcal</label>
                    <input
                      name="calories"
                      type="number"
                      value={mealForm.calories}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Białko (g)</label>
                    <input
                      name="protein"
                      type="number"
                      step="0.1"
                      value={mealForm.protein}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Węglowodany (g)</label>
                    <input
                      name="carbs"
                      type="number"
                      step="0.1"
                      value={mealForm.carbs}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tłuszcze (g)</label>
                    <input
                      name="fat"
                      type="number"
                      step="0.1"
                      value={mealForm.fat}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions sticky-footer">
                <button
                  type="button"
                  onClick={handleCloseAddMeal}
                  className="cancel-btn"
                >
                  Anuluj
                </button>
                <button type="submit" className="submit-btn">
                  Dodaj posiłek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecipeModal && (
        <div className="modal-overlay">
          <div className="modal-content recipe-modal">
            <div className="modal-header">
              <h2>Dodaj przepis</h2>
              <button
                className="close-btn"
                onClick={() => setShowRecipeModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-scroll-area">
              <div className="recipe-search-row">
                <input
                  type="text"
                  placeholder="Szukaj przepisu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <select
                  value={selectedDiet}
                  onChange={(e) => setSelectedDiet(e.target.value)}
                  className="diet-select"
                >
                  <option value="">Wszystkie diety</option>
                  {dietOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="recipes-list">
                {filteredRecipes.map((recipe) => (
                  <RecipeSelectCard
                    key={recipe._id}
                    recipe={recipe}
                    mealTypes={mealTypes}
                    onAddToMeal={handleAddRecipeToMeal}
                    onStartCustomizing={handleStartCustomizing}
                    formatKcal={formatKcal}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(customizingRecipe || editingEntry) && (
        <div className="modal-overlay">
          <div className="modal-content edit-diary-modal">
            <div className="modal-header">
              <h2>
                {customizingRecipe
                  ? `Dostosuj: ${customizingRecipe.name}`
                  : `Edytuj: ${editingEntry.name}`}
              </h2>
              <button
                className="close-btn"
                onClick={() => {
                  setCustomizingRecipe(null);
                  setEditingEntry(null);
                }}
              >
                &times;
              </button>
            </div>

            {editingEntry && editingEntry.type === "custom" ? (
              <form onSubmit={handleUpdateEntry} className="custom-meal-form">
                <div className="modal-scroll-area">
                  <div className="form-group">
                    <label>Nazwa</label>
                    <input
                      type="text"
                      value={editingEntry.name}
                      onChange={(e) =>
                        setEditingEntry({
                          ...editingEntry,
                          name: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kcal</label>
                      <input
                        type="number"
                        value={editingEntry.calories}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            calories: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Białko (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingEntry.protein}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            protein: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Węglowodany (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingEntry.carbs}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            carbs: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tłuszcze (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingEntry.fat}
                        onChange={(e) =>
                          setEditingEntry({
                            ...editingEntry,
                            fat: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions sticky-footer">
                  <button
                    type="button"
                    onClick={() => setEditingEntry(null)}
                    className="cancel-btn"
                  >
                    Anuluj
                  </button>
                  <button type="submit" className="submit-btn">
                    Zapisz zmiany
                  </button>
                </div>
              </form>
            ) : (
              <div className="custom-meal-form">
                <div className="modal-scroll-area">
                  <div className="edit-recipe-ingredients-complex">
                    <div className="ingredients-edit-header">
                      <span>Składnik</span>
                      <span>Ilość (g)</span>
                      <span>Kcal</span>
                      <span>B</span>
                      <span>W</span>
                      <span>T</span>
                      <span></span>
                    </div>
                    <div className="ingredients-edit-list">
                      {(customizingRecipe
                        ? customizingRecipe.tempIngredients
                        : editingEntry.ingredients
                      ).map((ing, idx) => (
                        <div key={idx} className="ing-edit-row-complex">
                          <div className="autocomplete-wrapper">
                            <input
                              type="text"
                              value={ing.name}
                              onChange={(e) =>
                                customizingRecipe
                                  ? handleEditCustomizingIngredient(
                                      idx,
                                      "name",
                                      e.target.value,
                                    )
                                  : handleEditIngredientInModal(
                                      idx,
                                      "name",
                                      e.target.value,
                                    )
                              }
                              onFocus={() => setActiveSearchRow(idx)}
                              onBlur={() =>
                                setTimeout(() => setActiveSearchRow(null), 200)
                              }
                              className="ing-edit-name"
                              placeholder="Szukaj..."
                            />
                            {activeSearchRow === idx && ing.name.length > 1 && (
                              <ul className="suggestions-list">
                                {getFilteredProducts(ing.name).length > 0 ? (
                                  getFilteredProducts(ing.name).map(
                                    (product) => (
                                      <li
                                        key={product._id}
                                        className="suggestion-item"
                                        onMouseDown={() =>
                                          handleProductSelectForDiary(
                                            idx,
                                            product,
                                            customizingRecipe
                                              ? "customizing"
                                              : "editing",
                                          )
                                        }
                                      >
                                        <span>{product.name}</span>
                                        <span className="suggestion-meta">
                                          {Math.round(product.calories)}{" "}
                                          kcal/100g
                                        </span>
                                      </li>
                                    ),
                                  )
                                ) : (
                                  <li className="suggestion-item suggestion-item-empty">
                                    Brak produktu w bazie
                                  </li>
                                )}
                              </ul>
                            )}
                          </div>

                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={ing.amount}
                            onChange={(e) =>
                              customizingRecipe
                                ? handleEditCustomizingIngredient(
                                    idx,
                                    "amount",
                                    e.target.value,
                                  )
                                : handleEditIngredientInModal(
                                    idx,
                                    "amount",
                                    e.target.value,
                                  )
                            }
                            className="ing-edit-val ing-edit-amount"
                            placeholder="g"
                          />

                          <input
                            type="number"
                            value={ing.calories ? Math.round(ing.calories) : ""}
                            onChange={(e) =>
                              customizingRecipe
                                ? handleEditCustomizingIngredient(
                                    idx,
                                    "calories",
                                    e.target.value,
                                  )
                                : handleEditIngredientInModal(
                                    idx,
                                    "calories",
                                    e.target.value,
                                  )
                            }
                            className="ing-edit-val"
                          />

                          <input
                            type="number"
                            step="0.1"
                            value={ing.protein}
                            onChange={(e) =>
                              customizingRecipe
                                ? handleEditCustomizingIngredient(
                                    idx,
                                    "protein",
                                    e.target.value,
                                  )
                                : handleEditIngredientInModal(
                                    idx,
                                    "protein",
                                    e.target.value,
                                  )
                            }
                            className="ing-edit-val"
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={ing.carbs}
                            onChange={(e) =>
                              customizingRecipe
                                ? handleEditCustomizingIngredient(
                                    idx,
                                    "carbs",
                                    e.target.value,
                                  )
                                : handleEditIngredientInModal(
                                    idx,
                                    "carbs",
                                    e.target.value,
                                  )
                            }
                            className="ing-edit-val"
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={ing.fat}
                            onChange={(e) =>
                              customizingRecipe
                                ? handleEditCustomizingIngredient(
                                    idx,
                                    "fat",
                                    e.target.value,
                                  )
                                : handleEditIngredientInModal(
                                    idx,
                                    "fat",
                                    e.target.value,
                                  )
                            }
                            className="ing-edit-val"
                          />

                          <button
                            className="ing-del-small"
                            onClick={() => {
                              if (customizingRecipe) {
                                setCustomizingRecipe({
                                  ...customizingRecipe,
                                  tempIngredients:
                                    customizingRecipe.tempIngredients.filter(
                                      (_, i) => i !== idx,
                                    ),
                                });
                              } else {
                                setEditingEntry({
                                  ...editingEntry,
                                  ingredients: editingEntry.ingredients.filter(
                                    (_, i) => i !== idx,
                                  ),
                                });
                              }
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="add-ing-edit-btn"
                      onClick={
                        customizingRecipe
                          ? handleAddCustomizingIngredient
                          : handleAddIngredientInModal
                      }
                    >
                      + Dodaj nowy składnik
                    </button>
                  </div>

                  <div className="nutrition-summary-box">
                    <h4>Podsumowanie:</h4>
                    <div className="nutrition-summary-grid">
                      <div>
                        <span>Kalorie</span>
                        <strong>
                          {customizingRecipe
                            ? formatKcal(
                                customizingRecipe.tempIngredients.reduce(
                                  (a, b) => a + (b.calories || 0),
                                  0,
                                ),
                              )
                            : formatKcal(
                                editingEntry.ingredients.reduce(
                                  (a, b) => a + (b.calories || 0),
                                  0,
                                ),
                              )}
                        </strong>
                      </div>

                      <div>
                        <span>Białko</span>
                        <strong>
                          {customizingRecipe
                            ? formatMacro(
                                customizingRecipe.tempIngredients.reduce(
                                  (a, b) => a + (b.protein || 0),
                                  0,
                                ),
                              )
                            : formatMacro(
                                editingEntry.ingredients.reduce(
                                  (a, b) => a + (b.protein || 0),
                                  0,
                                ),
                              )}
                          g
                        </strong>
                      </div>
                      <div>
                        <span>Węgle</span>
                        <strong>
                          {customizingRecipe
                            ? formatMacro(
                                customizingRecipe.tempIngredients.reduce(
                                  (a, b) => a + (b.carbs || 0),
                                  0,
                                ),
                              )
                            : formatMacro(
                                editingEntry.ingredients.reduce(
                                  (a, b) => a + (b.carbs || 0),
                                  0,
                                ),
                              )}
                          g
                        </strong>
                      </div>
                      <div>
                        <span>Tłuszcze</span>
                        <strong>
                          {customizingRecipe
                            ? formatMacro(
                                customizingRecipe.tempIngredients.reduce(
                                  (a, b) => a + (b.fat || 0),
                                  0,
                                ),
                              )
                            : formatMacro(
                                editingEntry.ingredients.reduce(
                                  (a, b) => a + (b.fat || 0),
                                  0,
                                ),
                              )}
                          g
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions sticky-footer">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setCustomizingRecipe(null);
                      setEditingEntry(null);
                    }}
                  >
                    Anuluj
                  </button>
                  <button
                    className="submit-btn"
                    onClick={
                      customizingRecipe
                        ? confirmCustomizedRecipe
                        : handleUpdateEntry
                    }
                  >
                    {customizingRecipe ? "Zatwierdź i dodaj" : "Zapisz zmiany"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showProductsModal && (
        <ProductsModal
          onClose={() => setShowProductsModal(false)}
          selectedDate={selectedDate}
          onEntryAdded={loadDiaryEntries}
        />
      )}
    </div>
  );
}

function EntryItem({ entry, onEdit, onDelete, formatKcal, formatMacro }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="entry-item">
      <div className="entry-left-content">
        {entry.image && !imgError ? (
          <img
            src={entry.image}
            alt={entry.name}
            className="entry-meal-image"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="entry-meal-placeholder">
            <img src={ImageIcon} alt="Brak" />
          </div>
        )}
        <div className="entry-text">
          <span className="entry-name-main">{entry.name}</span>
          <span className="entry-stats-sub">
            {formatKcal(entry.calories)} kcal | B: {formatMacro(entry.protein)}g
            W: {formatMacro(entry.carbs)}g T: {formatMacro(entry.fat)}g
          </span>
        </div>
      </div>
      <div className="entry-actions">
        <button
          className="entry-edit-btn"
          onClick={() => onEdit({ ...entry })}
          title="Edytuj wpis"
        >
          <img src={EditIcon} alt="Edytuj" />
        </button>
        <button
          className="entry-del-btn"
          onClick={() => onDelete(entry._id)}
          title="Usuń wpis"
        >
          <img src={DeleteIcon} alt="Usuń" />
        </button>
      </div>
    </div>
  );
}

function RecipeSelectCard({
  recipe,
  onAddToMeal,
  onStartCustomizing,
  mealTypes,
  formatKcal,
}) {
  const [imgError, setImgError] = useState(false);

  const getInitialMealType = (cat) => {
    if (Array.isArray(cat)) return cat[0] || "breakfast";
    return cat || "breakfast";
  };

  const [mealType, setMealType] = useState(getInitialMealType(recipe.category));

  return (
    <div className="recipe-select-card">
      {recipe.image && !imgError ? (
        <img
          src={recipe.image}
          alt={recipe.name}
          className="recipe-select-image"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="recipe-select-image-placeholder">
          <img src={ImageIcon} alt="Brak" />
        </div>
      )}
      <div className="recipe-select-info">
        <h4>{recipe.name}</h4>
        <span>
          {formatKcal
            ? formatKcal(recipe.calories)
            : Math.round(recipe.calories)}{" "}
          kcal/porcja
        </span>
      </div>
      <div className="recipe-select-controls">
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="form-select-small"
        >
          {mealTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => onAddToMeal(recipe, mealType)}
          className="add-recipe-meal-btn"
        >
          Dodaj
        </button>
        <button
          onClick={() => onStartCustomizing(recipe, mealType)}
          className="edit-recipe-meal-btn"
        >
          Edytuj
        </button>
      </div>
    </div>
  );
}

export default DiaryPage;
