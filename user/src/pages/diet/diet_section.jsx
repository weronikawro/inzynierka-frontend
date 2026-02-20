import React, { useRef, useState, useEffect } from "react";
import "./diet.css";
import ImageIcon from "../../assets/icons/meal.svg";

function DietSection({
  title,
  description,
  benefits,
  image,
  recipes,
  onRecipeClick,
  onAddToMeal,
  user,
}) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollWidth - clientWidth - scrollLeft > 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    const timeout = setTimeout(checkScroll, 500);
    return () => {
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timeout);
    };
  }, [recipes]);

  const scroll = (direction) => {
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const getCategoryName = (cat) => {
    const map = {
      breakfast: "Śniadanie",
      brunch: "II Śniadanie",
      lunch: "Obiad",
      dinner: "Kolacja",
      snack: "Przekąska",
      soup: "Zupa",
      dessert: "Deser",
      salad: "Sałatka",
      drink: "Napój",
    };
    return map[cat] || cat;
  };

  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="diet-section">
      <div className="diet-top">
        <img src={image} alt={title} className="diet-image" />

        <div className="diet-info">
          <h2 className="diet-title">{title}</h2>
          <p className="diet-description">{description}</p>
          <p className="diet-benefits">
            <strong>Korzyści zdrowotne:</strong> {benefits}
          </p>
        </div>
      </div>
      <div className="diet-divider-container">
        <hr className="diet-section-divider" />
        <h3 className="diet-recipes-heading">
          Przykładowe przepisy dostosowane do diety
        </h3>
      </div>
      <div className="diet-carousel-wrapper">
        {showLeftArrow && (
          <button
            className="carousel-arrow left"
            onClick={() => scroll("left")}
          >
            &#8592;
          </button>
        )}

        <div
          className="diet-recipes-scroll"
          ref={scrollContainerRef}
          onScroll={checkScroll}
        >
          {recipes.map((recipe) => {
            const categories = Array.isArray(recipe.category)
              ? recipe.category
              : recipe.category
                ? [recipe.category]
                : [];

            return (
              <div
                key={recipe._id}
                className="diet-recipe-card"
                onClick={() => onRecipeClick(recipe)}
              >
                <div className="diet-card-image">
                  <div className="diet-badges-container">
                    {categories.map((cat, index) => (
                      <span key={index} className="diet-category-badge">
                        {getCategoryName(cat)}
                      </span>
                    ))}
                  </div>

                  {recipe.image ? (
                    <img src={recipe.image} alt={recipe.name} />
                  ) : (
                    <div className="diet-placeholder">
                      <img
                        src={ImageIcon}
                        alt="Brak zdjęcia"
                        className="placeholder-icon-scaled"
                      />
                    </div>
                  )}
                </div>

                <div className="diet-card-content">
                  <h4>{recipe.name}</h4>

                  <div className="diet-card-stats">
                    <span className="diet-kcal">
                      {Math.round(recipe.calories)} kcal
                    </span>
                    <span className="diet-macros">
                      B:{Math.round(recipe.protein)} W:
                      {Math.round(recipe.carbs)} T:{Math.round(recipe.fat)}
                    </span>
                  </div>

                  <div className="diet-card-tags">
                    {recipe.tags &&
                      recipe.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="diet-mini-tag">
                          {tag}
                        </span>
                      ))}
                  </div>

                  {user && (
                    <button
                      className="diet-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToMeal(recipe);
                      }}
                    >
                      Dodaj
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            className="carousel-arrow right"
            onClick={() => scroll("right")}
          >
            &#8594;
          </button>
        )}
      </div>
    </div>
  );
}

export default DietSection;
