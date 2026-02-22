import React from "react";
import "./recipe_details.css";
import MealIcon from "../../assets/icons/meal.svg";
import {
  categoryTranslations,
  difficultyTranslations,
} from "../../utils/recipe_constants.js";

function RecipeDetails({ recipe, onClose, onAddToMeal, onEdit, user }) {
  if (!recipe) return null;

  const isMyRecipe = user && !recipe.isGlobal;

  const formatTime = (minutes) => {
    if (!minutes) return "Nie podano";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}min` : ""}`;
  };

  const getCategoryLabel = (categories) => {
    const cats = Array.isArray(categories) ? categories : [categories];
    return cats
      .map((c) => categoryTranslations[c] || c)
      .filter((c) => c)
      .join(", ");
  };

  const getDifficultyLabel = (diff) => {
    return difficultyTranslations[diff] || "Średni";
  };

  return (
    <div className="recipe-details-container">
      <div className="recipe-details-header">
        <div className="recipe-details-title">
          <h1>{recipe.name}</h1>
          {recipe.description && (
            <p className="recipe-description">{recipe.description}</p>
          )}
        </div>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="recipe-details-content">
        <div className="recipe-hero-image">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.name} />
          ) : (
            <div className="recipe-placeholder-hero">
              <img
                src={MealIcon}
                alt="Brak zdjęcia"
                className="recipe-icon-hero"
              />
            </div>
          )}
        </div>

        <div className="recipe-meta-row">
          <div className="info-card">
            <h3>Podstawowe informacje</h3>
            <div className="info-items">
              <div className="info-item">
                <span className="info-label">Porcje:</span>
                <span className="info-value">{recipe.servings}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Trudność:</span>
                <span className="info-value">
                  {getDifficultyLabel(recipe.difficulty)}
                </span>
              </div>

              {recipe.category && recipe.category.length > 0 && (
                <div className="info-item">
                  <span className="info-label">Kategoria:</span>
                  <span className="info-value">
                    {getCategoryLabel(recipe.category)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="info-card">
            <h3>Czas przygotowania</h3>
            <div className="info-items">
              <div className="info-item">
                <span className="info-label">Przygotowanie:</span>
                <span className="info-value">
                  {formatTime(recipe.prepTime)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Gotowanie:</span>
                <span className="info-value">
                  {formatTime(recipe.cookTime)}
                </span>
              </div>
              <div className="info-item total-time">
                <span className="info-label">Łączny czas:</span>
                <span className="info-value">
                  {formatTime((recipe.prepTime || 0) + (recipe.cookTime || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-card nutrition-card-full">
          <h3>Wartości odżywcze (na porcję)</h3>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <div className="nutrition-value">
                {Number(recipe.protein || 0).toFixed(1)}g
              </div>
              <div className="nutrition-label">Białko</div>
            </div>
            <div className="nutrition-item">
              <div className="nutrition-value">
                {Number(recipe.carbs || 0).toFixed(1)}g
              </div>
              <div className="nutrition-label">Węglowodany</div>
            </div>
            <div className="nutrition-item">
              <div className="nutrition-value">
                {Number(recipe.fat || 0).toFixed(1)}g
              </div>
              <div className="nutrition-label">Tłuszcze</div>
            </div>
          </div>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-tags-section">
            <h3>Właściwości</h3>
            <div className="recipe-tags-large">
              {recipe.tags.map((tag, idx) => (
                <span key={idx} className="recipe-tag-large">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="recipe-content-grid">
          <div className="ingredients-section">
            <h3>Składniki</h3>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="ingredient-item">
                  <span className="ingredient-bullet">•</span>
                  <span className="ingredient-text">
                    {typeof ing === "object" ? ing.name : ing}
                    {typeof ing === "object" && ing.amount > 0
                      ? ` (${ing.amount}g)`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="instructions-section">
            <h3>Sposób przygotowania</h3>
            <ol className="instructions-list">
              {recipe.instructions.map((inst, idx) => (
                <li key={idx} className="instruction-item">
                  <div className="instruction-number">{idx + 1}</div>
                  <div className="instruction-text">{inst}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="recipe-actions">
          {isMyRecipe && (
            <button
              className="edit-recipe-btn-details"
              onClick={() => onEdit(recipe)}
            >
              Edytuj przepis
            </button>
          )}

          {user && (
            <button
              className="add-to-meal-btn-large"
              onClick={() => onAddToMeal(recipe)}
            >
              Dodaj do dziennika
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetails;
