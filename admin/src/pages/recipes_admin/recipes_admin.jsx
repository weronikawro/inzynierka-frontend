import React, { useState, useEffect } from "react";
import ApiService from "../../utils/api.js";
import RecipeForm from "./recipe_admin.jsx";
import RecipeDetails from "./recipe_details_admin.jsx";
import "./recipes_admin.css";
import EditIcon from "../../assets/icons/edit.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import ViewIcon from "../../assets/icons/visibility.svg";
import NoImageIcon from "../../assets/icons/image.svg";
import {
  categoryTranslations,
  dietOptions,
} from "../../utils/recipe_constants.js";

function RecipesPage({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState(null);

  const getBadgeClass = (categoryKey) => {
    if (!categoryKey) return "badge-gray";
    const key = categoryKey.toLowerCase();
    switch (key) {
      case "breakfast":
        return "badge-yellow";
      case "brunch":
        return "badge-orange";
      case "lunch":
        return "badge-blue";
      case "dinner":
        return "badge-indigo";
      case "snack":
        return "badge-purple";
      default:
        return "badge-gray";
    }
  };

  useEffect(() => {
    if (user) loadRecipes();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [recipes, searchQuery, selectedDiet]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = recipes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(query);
        const authorMatch = (r.authorName || "Administrator")
          .toLowerCase()
          .includes(query);

        const categories = Array.isArray(r.category)
          ? r.category
          : r.category
            ? [r.category]
            : [];

        const catMatch = categories.some((cat) => {
          const key = cat.toLowerCase();
          const label = (categoryTranslations[cat] || "").toLowerCase();
          return key.includes(query) || label.includes(query);
        });

        return nameMatch || authorMatch || catMatch;
      });
    }

    if (selectedDiet) {
      result = result.filter((r) => r.tags && r.tags.includes(selectedDiet));
    }

    setFilteredRecipes(result);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortedRecipes = () => {
    const sorted = [...filteredRecipes];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "authorName") {
          const getAuthor = (r) =>
            r.authorName || (r.isGlobal ? "Administrator" : "Użytkownik");
          aValue = getAuthor(a);
          bValue = getAuthor(b);
        }
        if (sortConfig.key === "category") {
          const getCat = (r) =>
            Array.isArray(r.category) ? r.category[0] || "" : r.category || "";
          aValue = getCat(a);
          bValue = getCat(b);
        }

        if (!aValue) aValue = "";
        if (!bValue) bValue = "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const getSortIndicator = (key) =>
    sortConfig.key !== key ? null : sortConfig.direction === "asc" ? "▲" : "▼";

  const handleRecipeAdded = (newRecipe) => {
    if (!newRecipe) return;
    setRecipes((prev) => {
      const exists = prev.find((r) => r._id === newRecipe._id);
      return exists
        ? prev.map((r) => (r._id === newRecipe._id ? newRecipe : r))
        : [newRecipe, ...prev];
    });
    setShowAddRecipe(false);
    setRecipeToEdit(null);
    alert("Przepis został pomyślnie zapisany.");
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Czy na pewno chcesz usunąć ten przepis?")) {
      try {
        await ApiService.deleteRecipe(id);
        setRecipes((prev) => prev.filter((r) => r._id !== id));
        alert("Przepis został usunięty.");
      } catch (e) {
        alert("Błąd usuwania przepisu.");
      }
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toISOString().split("T")[0];
  };

  const displayedRecipes = getSortedRecipes();

  return (
    <div className="admin-content-container">
      <div className="admin-page-header">
        <div>
          <h1>Zarządzanie Przepisami</h1>
          <p>Baza przepisów systemowych</p>
        </div>
        <button
          className="add-btn-primary"
          onClick={() => setShowAddRecipe(true)}
        >
          <span>+</span> Dodaj nowy przepis
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Szukaj po nazwie, kategorii, autorze..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="diet-filter-wrapper">
          <select
            className="admin-select-input"
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
          >
            <option value="">Wszystkie diety</option>
            {dietOptions.map((diet) => (
              <option key={diet} value={diet}>
                {diet}
              </option>
            ))}
          </select>
        </div>

        <div className="stats-badge">Przepisów: {displayedRecipes.length}</div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading-message">Ładowanie...</div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th width="70">Obraz</th>
                <th onClick={() => handleSort("name")} className="sortable-th">
                  Nazwa {getSortIndicator("name")}
                </th>
                <th
                  onClick={() => handleSort("category")}
                  className="sortable-th"
                >
                  Kategorie {getSortIndicator("category")}
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="sortable-th"
                >
                  Data {getSortIndicator("createdAt")}
                </th>
                <th
                  onClick={() => handleSort("calories")}
                  className="sortable-th"
                >
                  Kcal {getSortIndicator("calories")}
                </th>
                <th
                  onClick={() => handleSort("authorName")}
                  className="sortable-th"
                >
                  Autor {getSortIndicator("authorName")}
                </th>
                <th className="th-actions">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecipes.length > 0 ? (
                displayedRecipes.map((recipe) => {
                  const cats = Array.isArray(recipe.category)
                    ? recipe.category
                    : recipe.category
                      ? [recipe.category]
                      : [];

                  return (
                    <tr key={recipe._id}>
                      <td>
                        <div className="table-img-preview">
                          {recipe.image ? (
                            <img src={recipe.image} alt="mini" />
                          ) : (
                            <img
                              src={NoImageIcon}
                              alt="Brak zdjęcia"
                              className="placeholder-icon"
                            />
                          )}
                        </div>
                      </td>
                      <td className="td-name">{recipe.name}</td>
                      <td>
                        <div className="badges-wrapper">
                          {cats.length > 0 ? (
                            cats.map((cat, idx) => (
                              <span
                                key={idx}
                                className={`category-badge ${getBadgeClass(cat)}`}
                              >
                                {categoryTranslations[cat] || cat}
                              </span>
                            ))
                          ) : (
                            <span className="category-badge badge-gray">
                              Inne
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="td-gray">
                        {formatDate(recipe.createdAt)}
                      </td>
                      <td>
                        {recipe.calories ? Math.round(recipe.calories) : 0}
                      </td>
                      <td className="td-gray">
                        {recipe.authorName ||
                          (recipe.isGlobal ? "Admin" : "User")}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => setRecipeToEdit(recipe)}
                            title="Edytuj"
                          >
                            <img src={EditIcon} alt="Edytuj" />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={(e) => handleDeleteClick(e, recipe._id)}
                            title="Usuń"
                          >
                            <img src={DeleteIcon} alt="Usuń" />
                          </button>
                          <button
                            className="btn-icon btn-view"
                            onClick={() => setSelectedRecipe(recipe)}
                            title="Podgląd"
                          >
                            <img src={ViewIcon} alt="Podgląd" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-message">
                    Brak wyników
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(showAddRecipe || recipeToEdit) && (
        <div
          className="drawer-overlay"
          onClick={() => {
            setShowAddRecipe(false);
            setRecipeToEdit(null);
          }}
        >
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <RecipeForm
              initialData={recipeToEdit}
              onRecipeAdded={handleRecipeAdded}
              onClose={() => {
                setShowAddRecipe(false);
                setRecipeToEdit(null);
              }}
            />
          </div>
        </div>
      )}

      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div
            className="modal-content-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <RecipeDetails
              recipe={selectedRecipe}
              onClose={() => setSelectedRecipe(null)}
              onEdit={() => {
                setRecipeToEdit(selectedRecipe);
                setSelectedRecipe(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipesPage;
