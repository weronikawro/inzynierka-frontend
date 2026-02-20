import React, { useState, useEffect } from "react";
import ApiService from "../../utils/api.js";
import DietSection from "./diet_section.jsx";
import RecipeDetails from "../recipes/recipe_details.jsx";
import "./diet.css";

import { DIET_DEFINITIONS } from "../../utils/diet_constants.js";

function DietPage({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [customizingRecipe, setCustomizingRecipe] = useState(null);
  const [mealType, setMealType] = useState("breakfast");
  const [selectedDateForDiary, setSelectedDateForDiary] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error("Błąd pobierania przepisów:", error);
    } finally {
      setLoading(false);
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
    try {
      const diaryData = {
        name: customizingRecipe.name,
        date: selectedDateForDiary,
        mealType: mealType,
        ...tempTotals,
        type: "recipe",
        recipeId: customizingRecipe._id,
        ingredients: customizingRecipe.tempIngredients,
      };
      await ApiService.addDiaryEntry(diaryData);
      setCustomizingRecipe(null);
      alert("Dodano do dziennika!");
    } catch (err) {
      alert("Błąd dodawania.");
    }
  };

  return (
    <div className="content-container">
      <div className="diets-layout">
        <div className="diet-page-header">
          <h1>Rodzaje diet</h1>
          <p>
            Dowiedz się więcej o dietach eliminacyjnych i zdrowotnych. Poznaj
            zasady i porady, które pomogą Ci zadbać o lepsze samopoczucie,
            energię oraz zdrowie każdego dnia.
          </p>
        </div>

        {loading ? (
          <div className="loading-message">Ładowanie diet...</div>
        ) : (
          <>
            {DIET_DEFINITIONS.map((diet) => {
              const dietRecipes = recipes.filter(
                (r) => r.tags && r.tags.includes(diet.tag),
              );

              if (dietRecipes.length === 0) return null;

              return (
                <DietSection
                  key={diet.id}
                  title={diet.title}
                  description={diet.desc}
                  benefits={diet.benefits}
                  image={diet.image}
                  recipes={dietRecipes}
                  onRecipeClick={setSelectedRecipe}
                  onAddToMeal={handleAddToMeal}
                  user={user}
                />
              );
            })}
          </>
        )}
      </div>

      {selectedRecipe && (
        <div className="modal-overlay fullscreen-overlay">
          <RecipeDetails
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onAddToMeal={handleAddToMeal}
            onEdit={() => {}}
            user={user}
          />
        </div>
      )}

      {customizingRecipe && (
        <div className="modal-overlay">
          <div className="modal-content customization-modal-complex">
            <div className="modal-header">
              <h2 className="summary-title">
                Dostosuj: {customizingRecipe.name}
              </h2>
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
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="modern-select"
                  >
                    <option value="breakfast">Śniadanie</option>
                    <option value="brunch">Drugie śniadanie</option>
                    <option value="lunch">Obiad</option>
                    <option value="dinner">Kolacja</option>
                    <option value="snack">Przekąska</option>
                  </select>
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
                        value={ing.calories || ""}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "calories",
                            e.target.value,
                          )
                        }
                        className="ing-edit-val"
                      />
                      <input
                        type="number"
                        value={ing.protein || ""}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "protein",
                            e.target.value,
                          )
                        }
                        className="ing-edit-val"
                      />
                      <input
                        type="number"
                        value={ing.carbs || ""}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "carbs",
                            e.target.value,
                          )
                        }
                        className="ing-edit-val"
                      />
                      <input
                        type="number"
                        value={ing.fat || ""}
                        onChange={(e) =>
                          handleEditCustomizingIngredient(
                            idx,
                            "fat",
                            e.target.value,
                          )
                        }
                        className="ing-edit-val"
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

              <div className="nutrition-summary-box">
                <h4>Podsumowanie:</h4>
                <div className="nutrition-summary-grid">
                  <div>
                    <span>Kalorie</span>
                    <strong>{Math.round(tempTotals.calories)}</strong>
                  </div>
                  <div>
                    <span>Białko</span>
                    <strong>{Math.round(tempTotals.protein)}g</strong>
                  </div>
                  <div>
                    <span>Węgle</span>
                    <strong>{Math.round(tempTotals.carbs)}g</strong>
                  </div>
                  <div>
                    <span>Tłuszcze</span>
                    <strong>{Math.round(tempTotals.fat)}g</strong>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setCustomizingRecipe(null)}
                >
                  Anuluj
                </button>
                <button className="submit-btn" onClick={confirmDiaryAdd}>
                  Dodaj do dziennika
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DietPage;
