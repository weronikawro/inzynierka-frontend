import React, { useState, useEffect } from "react";
import ApiService from "../../utils/api.js";
import ProductForm from "./product_admin.jsx";
import "./products_admin.css";

import EditIcon from "../../assets/icons/edit.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import NoImageIcon from "../../assets/icons/image.svg";

function ProductsPage({ user }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const categoryOptions = [
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

  const getCategoryLabel = (val) => {
    const found = categoryOptions.find((c) => c.value === val);
    return found ? found.label : val;
  };

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = products;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(query));
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(result);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortedProducts = () => {
    const sorted = [...filteredProducts];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const getSortIndicator = (key) =>
    sortConfig.key !== key ? null : sortConfig.direction === "asc" ? "▲" : "▼";

  const handleProductSaved = (savedProduct) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p._id === savedProduct._id);
      return exists
        ? prev.map((p) => (p._id === savedProduct._id ? savedProduct : p))
        : [...prev, savedProduct];
    });
    setShowAddProduct(false);
    setProductToEdit(null);
    alert("Produkt zapisany.");
  };

  const handleDeleteClick = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Czy na pewno chcesz usunąć ten produkt?")) {
      try {
        await ApiService.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (e) {
        alert("Błąd usuwania.");
      }
    }
  };

  const displayedProducts = getSortedProducts();

  return (
    <div className="products-content-container">
      <div className="products-page-header">
        <div>
          <h1>Baza Produktów</h1>
          <p>Zarządzaj składnikami do przepisów</p>
        </div>
        <button
          className="add-btn-primary"
          onClick={() => setShowAddProduct(true)}
        >
          <span>+</span> Dodaj produkt
        </button>
      </div>

      <div className="products-toolbar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Szukaj produktu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="products-search-input"
          />
        </div>

        <div className="category-filter-wrapper">
          <select
            className="products-select-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Wszystkie kategorie</option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="stats-badge">Produktów: {displayedProducts.length}</div>
      </div>

      <div className="products-table-container">
        {loading ? (
          <div className="loading-message">Ładowanie...</div>
        ) : (
          <table className="products-data-table">
            <thead>
              <tr>
                <th width="60">Img</th>
                <th onClick={() => handleSort("name")} className="sortable-th">
                  Nazwa {getSortIndicator("name")}
                </th>
                <th
                  onClick={() => handleSort("category")}
                  className="sortable-th"
                >
                  Kategoria {getSortIndicator("category")}
                </th>
                <th
                  onClick={() => handleSort("calories")}
                  className="sortable-th"
                >
                  Kcal (100g) {getSortIndicator("calories")}
                </th>
                <th>Makro (B / W / T)</th>
                <th className="th-actions">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.length > 0 ? (
                displayedProducts.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <div className="table-img-preview">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="real-img"
                          />
                        ) : (
                          <img
                            src={NoImageIcon}
                            className="placeholder-icon"
                            alt="Brak zdjęcia"
                          />
                        )}
                      </div>
                    </td>
                    <td className="td-name">{prod.name}</td>
                    <td>
                      <span className="prod-badge">
                        {getCategoryLabel(prod.category)}
                      </span>
                    </td>
                    <td className="td-calories">{prod.calories}</td>
                    <td className="td-calories">
                      {Math.round(prod.calories || 0)}
                    </td>
                    <td>
                      <div className="macro-mini">
                        <span className="macro-protein">
                          {Number(prod.protein || 0).toFixed(1)}g
                        </span>{" "}
                        /
                        <span className="macro-carbs">
                          {Number(prod.carbs || 0).toFixed(1)}g
                        </span>{" "}
                        /
                        <span className="macro-fat">
                          {Number(prod.fat || 0).toFixed(1)}g
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => setProductToEdit(prod)}
                        >
                          <img src={EditIcon} alt="Edit" />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={(e) => handleDeleteClick(e, prod._id)}
                        >
                          <img src={DeleteIcon} alt="Del" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table-message">
                    Brak produktów
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(showAddProduct || productToEdit) && (
        <div
          className="drawer-overlay"
          onClick={() => {
            setShowAddProduct(false);
            setProductToEdit(null);
          }}
        >
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <ProductForm
              initialData={productToEdit}
              onProductSaved={handleProductSaved}
              onClose={() => {
                setShowAddProduct(false);
                setProductToEdit(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
