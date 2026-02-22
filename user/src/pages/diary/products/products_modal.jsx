import React, { useState, useEffect } from "react";
import ApiService from "../../../utils/api";
import ProductAddForm from "./product_add_form.jsx";
import "./products_modal.css";

import AddIcon from "../../../assets/icons/add.svg";
import EditIcon from "../../../assets/icons/edit.svg";
import DeleteIcon from "../../../assets/icons/delete.svg";

function ProductsModal({ onClose, selectedDate, onEntryAdded }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingToDiary, setAddingToDiary] = useState(null);
  const [addAmount, setAddAmount] = useState(100);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");

  const mealTypes = [
    { value: "breakfast", label: "Śniadanie" },
    { value: "brunch", label: "Drugie śniadanie" },
    { value: "lunch", label: "Obiad" },
    { value: "dinner", label: "Kolacja" },
    { value: "snack", label: "Przekąska" },
  ];

  const categories = [
    { value: "", label: "Wszystkie kategorie" },
    { value: "vegetables", label: "Warzywa" },
    { value: "fruits", label: "Owoce" },
    { value: "dairy", label: "Nabiał" },
    { value: "meat", label: "Mięso/Ryby" },
    { value: "grains", label: "Zbożowe" },
    { value: "fats", label: "Tłuszcze" },
    { value: "spices", label: "Przyprawy" },
    { value: "drinks", label: "Napoje" },
    { value: "other", label: "Inne" },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToDiaryConfirm = async () => {
    try {
      const ratio = parseFloat(addAmount) / 100;
      const payload = {
        name: addingToDiary.name,
        date: selectedDate,
        mealType: selectedMealType,
        calories: Math.round(parseFloat(addingToDiary.calories) * ratio),
        protein: parseFloat(addingToDiary.protein) * ratio,
        carbs: parseFloat(addingToDiary.carbs) * ratio,
        fat: parseFloat(addingToDiary.fat) * ratio,
        portion: parseFloat(addAmount),
        type: "custom",
      };
      await ApiService.addDiaryEntry(payload);
      if (onEntryAdded) onEntryAdded();
      setAddingToDiary(null);
    } catch (e) {
      alert("Błąd dodawania");
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error("Brak ID produktu do usunięcia");
      return;
    }

    if (!window.confirm("Czy na pewno chcesz usunąć ten produkt z bazy?"))
      return;

    try {
      await ApiService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (e) {
      console.error("Błąd usuwania:", e);
      alert("Nie udało się usunąć produktu.");
    }
  };
  const handleProductSaved = () => {
    loadProducts();
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? p.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const isFormVisible = showAddForm || editingProduct;

  return (
    <div className="modal-overlay">
      <div className="modal-content products-modal-content">
        <div className="modal-header">
          <h2>
            {isFormVisible
              ? editingProduct
                ? "Edytuj produkt"
                : "Nowy produkt"
              : "Baza Produktów"}
          </h2>
          <button
            className="close-btn"
            onClick={
              isFormVisible
                ? () => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                  }
                : onClose
            }
          >
            ×
          </button>
        </div>

        <div className="modal-scroll-area">
          {isFormVisible ? (
            <ProductAddForm
              initialData={editingProduct}
              onProductAdded={handleProductSaved}
              onCancel={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
              isEmbedded={true}
            />
          ) : (
            <div className="modal-scroll-area">
              <div className="products-modal-container">
                {addingToDiary && (
                  <div className="amount-prompt-overlay">
                    <div className="amount-prompt-card">
                      <h4>Ile gramów dodać?</h4>
                      <p className="prompt-product-name">
                        {addingToDiary.name}
                      </p>

                      <div className="amount-input-row">
                        <input
                          type="number"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          autoFocus
                        />
                        <span>g</span>
                      </div>

                      <div className="meal-type-row">
                        <select
                          className="form-select"
                          value={selectedMealType}
                          onChange={(e) => setSelectedMealType(e.target.value)}
                        >
                          {mealTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="amount-actions">
                        <button
                          className="cancel-btn"
                          onClick={() => setAddingToDiary(null)}
                        >
                          Anuluj
                        </button>
                        <button
                          className="submit-btn"
                          onClick={handleAddToDiaryConfirm}
                        >
                          Dodaj
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="recipe-search-row">
                  <input
                    type="text"
                    placeholder="Szukaj produktu..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="diet-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="submit-btn add-custom-prod-btn"
                    onClick={() => setShowAddForm(true)}
                  >
                    Dodaj własny
                  </button>
                </div>

                <div className="products-list-scroll">
                  {filteredProducts.map((prod) => (
                    <div key={prod._id} className="product-item-card">
                      <div className="prod-info">
                        <div className="prod-header">
                          <span className="prod-name">{prod.name}</span>
                          {!prod.isSystem && (
                            <span className="prod-badge user">Twój</span>
                          )}
                        </div>
                        <div className="prod-macros">
                          <span>{Math.round(prod.calories)} kcal</span>
                          <span>B: {parseFloat(prod.protein).toFixed(1)}</span>
                          <span>W: {parseFloat(prod.carbs).toFixed(1)}</span>
                          <span>T: {parseFloat(prod.fat).toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="prod-actions-group">
                        <button
                          className="btn-action-prod add"
                          onClick={() => {
                            setAddingToDiary(prod);
                            setAddAmount(100);
                          }}
                        >
                          <img src={AddIcon} alt="Dodaj" />
                        </button>
                        {!prod.isSystem && (
                          <>
                            <button
                              className="btn-action-prod edit"
                              onClick={() => setEditingProduct(prod)}
                            >
                              <img src={EditIcon} alt="Edytuj" />
                            </button>
                            <button
                              className="btn-action-prod del"
                              onClick={() => handleDelete(prod._id)}
                            >
                              <img src={DeleteIcon} alt="Usuń" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsModal;
