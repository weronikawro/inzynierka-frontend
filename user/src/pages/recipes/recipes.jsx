import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../utils/api.js";
import RecipeForm from "./recipe.jsx";
import RecipeDetails from "./recipe_details.jsx";
import "./recipes.css";
import { formCategories, availableTags } from "../../utils/recipe_constants.js";

import MealIcon from "../../assets/icons/meal.svg";

function CustomSelect({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);
  const labelToShow = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`custom-select-container ${isOpen ? "open" : ""}`}
      ref={containerRef}
    >
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className={!selectedOption ? "placeholder-text" : ""}>
          {labelToShow}
        </span>
        <div className="custom-arrow"></div>
      </div>
      {isOpen && (
        <div className="custom-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-option ${value === option.value ? "selected" : ""}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipesPage({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipeToEdit, setRecipeToEdit] = useState(null);
  const [customizingRecipe, setCustomizingRecipe] = useState(null);
  const [mealType, setMealType] = useState("breakfast");
  const [selectedDateForDiary, setSelectedDateForDiary] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [selectedTags, setSelectedTags] = useState([]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filterCategories = [
    { value: "", label: "Wszystkie posiłki" },
    ...formCategories,
  ];

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    if (showAddRecipe || selectedRecipe || customizingRecipe || recipeToEdit) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll");
  }, [showAddRecipe, selectedRecipe, customizingRecipe, recipeToEdit]);

  useEffect(() => {
    applyFilters();
  }, [
    recipes,
    selectedTags,
    searchQuery,
    sourceFilter,
    selectedCategory,
    user,
  ]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getRecipes();
      setRecipes(data);
    } catch (error) {
      setError("Błąd podczas ładowania przepisów");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...recipes];

    if (user) {
      if (sourceFilter === "user")
        filtered = filtered.filter((r) => !r.isGlobal);
      else if (sourceFilter === "global")
        filtered = filtered.filter((r) => r.isGlobal);
    }

    if (selectedCategory) {
      filtered = filtered.filter((r) =>
        Array.isArray(r.category)
          ? r.category.includes(selectedCategory)
          : r.category === selectedCategory,
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((recipe) =>
        selectedTags.every((tag) => recipe.tags && recipe.tags.includes(tag)),
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.name?.toLowerCase().includes(query) ||
          (recipe.description &&
            recipe.description.toLowerCase().includes(query)),
      );
    }

    setFilteredRecipes(filtered);
  }, [
    recipes,
    selectedTags,
    searchQuery,
    sourceFilter,
    selectedCategory,
    user,
  ]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleRecipeAdded = (newRecipe) => {
    if (!newRecipe) return;
    setRecipes((prev) => [newRecipe, ...prev]);
    setShowAddRecipe(false);
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleDeleteRecipe = async (e, recipeId) => {
    e.stopPropagation();
    if (!window.confirm("Czy na pewno chcesz trwale usunąć ten przepis?"))
      return;
    try {
      await ApiService.deleteRecipe(recipeId);
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (err) {
      setError("Błąd podczas usuwania przepisu");
    }
  };

  const handleAddToMeal = (recipe) => {
    setSelectedDateForDiary(new Date().toISOString().split("T")[0]);
    setCustomizingRecipe({
      ...recipe,
      tempIngredients: Array.isArray(recipe.ingredients)
        ? JSON.parse(JSON.stringify(recipe.ingredients))
        : [],
    });
    setSelectedRecipe(null);
  };

  const handleEditCustomizingIngredient = (idx, field, value) => {
    if (field !== "name" && value < 0) return;
    const updated = [...customizingRecipe.tempIngredients];
    updated[idx] = {
      ...updated[idx],
      [field]: field === "name" ? value : value === "" ? 0 : parseFloat(value),
    };
    setCustomizingRecipe({ ...customizingRecipe, tempIngredients: updated });
  };

  const handleAddCustomizingIngredient = () => {
    setCustomizingRecipe({
      ...customizingRecipe,
      tempIngredients: [
        ...customizingRecipe.tempIngredients,
        { name: "Nowy składnik", calories: 0, protein: 0, carbs: 0, fat: 0 },
      ],
    });
  };

  const tempTotals = customizingRecipe?.tempIngredients?.reduce(
    (acc, ing) => ({
      calories: acc.calories + (parseFloat(ing.calories) || 0),
      protein: acc.protein + (parseFloat(ing.protein) || 0),
      carbs: acc.carbs + (parseFloat(ing.carbs) || 0),
      fat: acc.fat + (parseFloat(ing.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const confirmDiaryAdd = async () => {
    setLoading(true);
    try {
      await ApiService.addDiaryEntry({
        name: customizingRecipe.name,
        date: selectedDateForDiary,
        mealType: mealType,
        ...tempTotals,
        type: "recipe",
        recipeId: customizingRecipe._id,
        ingredients: customizingRecipe.tempIngredients,
        image: customizingRecipe.image,
      });
      setCustomizingRecipe(null);
      alert(`Dodano przepis do dziennika!`);
    } catch (err) {
      setError("Nie udało się dodać przepisu.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="content-container">
      {error && <div className="error-message">{error}</div>}

      <div className="recipes-layout">
        <div className="recipes-filters">
          {user && (
            <button
              className="add-recipe-btn"
              onClick={() => setShowAddRecipe(true)}
            >
              Dodaj przepis
            </button>
          )}

          <div className="filter-section">
            {user && (
              <div className="source-filter-buttons">
                <button
                  className={`source-btn ${sourceFilter === "all" ? "active" : ""}`}
                  onClick={() => setSourceFilter("all")}
                >
                  Wszystkie
                </button>
                <button
                  className={`source-btn ${sourceFilter === "user" ? "active" : ""}`}
                  onClick={() => setSourceFilter("user")}
                >
                  Moje
                </button>
                <button
                  className={`source-btn ${sourceFilter === "global" ? "active" : ""}`}
                  onClick={() => setSourceFilter("global")}
                >
                  Domyślne
                </button>
              </div>
            )}

            <div className="search-box">
              <input
                type="text"
                placeholder="Szukaj..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="search-box">
              <CustomSelect
                options={filterCategories}
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                placeholder="Wszystkie posiłki"
              />
            </div>

            <div className="filter-tags">
              {availableTags.map((tag) => (
                <label key={tag} className="tag-filter">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  <span className="checkmark"></span>
                  {tag}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="recipes-grid">
          {loading && !customizingRecipe ? (
            <div className="loading-message">Ładowanie...</div>
          ) : filteredRecipes.length === 0 ? (
            <div className="no-recipes">Brak przepisów.</div>
          ) : (
            filteredRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="recipe-card"
                onClick={() => handleRecipeClick(recipe)}
              >
                {user && !recipe.isGlobal && (
                  <button
                    className="delete-recipe-card-btn"
                    onClick={(e) => handleDeleteRecipe(e, recipe._id)}
                    title="Usuń przepis"
                  >
                    ×
                  </button>
                )}

                <div className="recipe-image">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="recipe-card-img"
                    />
                  ) : (
                    <div className="recipe-placeholder">
                      <img
                        src={MealIcon}
                        alt="Brak zdjęcia"
                        className="recipe-placeholder-img"
                      />
                    </div>
                  )}
                </div>
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.name}</h3>
                  <div className="recipe-stats-row">
                    <div className="recipe-calories">
                      {Math.round(recipe.calories || 0)} kcal
                    </div>
                    <div className="recipe-macros">
                      <span>B: {Math.round(recipe.protein || 0)}g</span>
                      <span>W: {Math.round(recipe.carbs || 0)}g</span>
                      <span>T: {Math.round(recipe.fat || 0)}g</span>
                    </div>
                  </div>
                  {recipe.tags && (
                    <div className="recipe-tags">
                      {recipe.tags.map((tag, idx) => (
                        <span key={idx} className="recipe-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {user && (
                    <button
                      className="add-meal-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToMeal(recipe);
                      }}
                    >
                      Dodaj
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAddRecipe && (
        <div
          className="drawer-overlay-left"
          onClick={() => setShowAddRecipe(false)}
        >
          <div
            className="drawer-content-left"
            onClick={(e) => e.stopPropagation()}
          >
            <RecipeForm
              onRecipeAdded={handleRecipeAdded}
              onClose={() => setShowAddRecipe(false)}
            />
          </div>
        </div>
      )}

      {recipeToEdit && (
        <div
          className="drawer-overlay-left"
          onClick={() => setRecipeToEdit(null)}
        >
          <div
            className="drawer-content-left"
            onClick={(e) => e.stopPropagation()}
          >
            <RecipeForm
              initialData={recipeToEdit}
              onRecipeAdded={(updated) => {
                setRecipes((prev) =>
                  prev.map((r) => (r._id === updated._id ? updated : r)),
                );
                setRecipeToEdit(null);
              }}
              onClose={() => setRecipeToEdit(null)}
            />
          </div>
        </div>
      )}

      {selectedRecipe && (
        <div className="modal-overlay fullscreen-overlay">
          <RecipeDetails
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onAddToMeal={handleAddToMeal}
            onEdit={(recipe) => {
              setRecipeToEdit(recipe);
              setSelectedRecipe(null);
            }}
            user={user}
          />
        </div>
      )}

      {customizingRecipe && (
        <div className="modal-overlay">
          <div className="modal-content customization-modal-complex">
            <div className="modal-header">
              <h2>Dostosuj: {customizingRecipe.name}</h2>
              <button
                className="close-btn"
                onClick={() => setCustomizingRecipe(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-scroll-area">
              <div className="form-row-custom">
                <div className="form-group">
                  <label className="macro-label">Data</label>
                  <input
                    type="date"
                    value={selectedDateForDiary}
                    onChange={(e) => setSelectedDateForDiary(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="macro-label">Posiłek</label>
                  <CustomSelect
                    options={categories.filter((c) => c.value !== "")}
                    value={mealType}
                    onChange={(val) => setMealType(val)}
                    placeholder="Wybierz posiłek"
                  />
                </div>
              </div>
              <div className="ingredients-edit-section">
                <div className="ingredients-edit-header">
                  <span>Składnik</span>
                  <span>Kcal</span>
                  <span>B</span>
                  <span>W</span>
                  <span>T</span>
                  <span></span>
                </div>
                <div className="ingredients-edit-list">
                  {customizingRecipe.tempIngredients.map((ing, idx) => (
                    <div key={idx} className="ing-edit-row-complex">
                      <input
                        value={ing.name}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "name",
                            e.target.value,
                          )
                        }
                        className="ing-edit-name"
                      />
                      <input
                        type="number"
                        min="0"
                        value={ing.calories || ""}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "calories",
                            e.target.value,
                          )
                        }
                        className="ing-edit-val"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        min="0"
                        value={ing.protein || ""}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "protein",
                            e.target.value,
                          )
                        }
                        className="ing-edit-val"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        min="0"
                        value={ing.carbs || ""}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "carbs",
                            e.target.value,
                          )
                        }
                        className="ing-edit-val"
                        placeholder="0"
                      />
                      <input
                        type="number"
                        min="0"
                        value={ing.fat || ""}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "fat",
                            e.target.value,
                          )
                        }
                        className="ing-edit-val"
                        placeholder="0"
                      />
                      <button
                        className="ing-del-small"
                        onClick={() =>
                          setCustomizingRecipe({
                            ...customizingRecipe,
                            tempIngredients:
                              customizingRecipe.tempIngredients.filter(
                                (_, i) => i !== idx,
                              ),
                          })
                        }
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="add-ing-edit-btn"
                  onClick={handleAddCustomizingIngredient}
                >
                  + Dodaj własny składnik
                </button>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setCustomizingRecipe(null)}
                >
                  Anuluj
                </button>
                <button
                  className="submit-btn"
                  onClick={confirmDiaryAdd}
                  disabled={loading}
                >
                  {loading ? "..." : "Dodaj"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipesPage;
