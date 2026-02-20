import React, { useState, useEffect, useRef } from "react";
import "./navbar.css";

function UserAccount({ user, onLogout, setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const getInitials = (firstName = "", lastName = "") => {
    if (!firstName) return "?";
    const firstInitial = firstName.charAt(0);
    const lastInitial = lastName ? lastName.charAt(0) : "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const handleLinkClick = (page) => {
    setCurrentPage(page);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <div
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Kliknij, aby otworzyć menu"
      >
        <div className="user-avatar">
          {user.image ? (
            <img src={user.image} alt="Avatar" className="user-avatar-img" />
          ) : (
            getInitials(user.firstName, user.lastName)
          )}
        </div>
        <div className="user-info">
          <span className="user-name">
            {user.firstName} {user.lastName}
          </span>
        </div>
      </div>
      {isOpen && (
        <ul className="simple-dropdown-menu">
          <li onClick={() => handleLinkClick("account")}>Konto</li>
          <li onClick={handleLogout} className="logout-option">
            Wyloguj
          </li>
        </ul>
      )}
    </div>
  );
}

const Navbar = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const hiddenPages = ["forgot-password", "reset-password"];

  if (hiddenPages.includes(currentPage)) {
    return null;
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allMenuItems = [
    { id: "home", label: "Strona główna", requireAuth: false },
    { id: "diary", label: "Dziennik", requireAuth: true },
    { id: "diet", label: "Diety", requireAuth: false },
    { id: "recipes", label: "Przepisy", requireAuth: false },
    { id: "articles", label: "Artykuły", requireAuth: false },
  ];

  const menuItems = allMenuItems.filter((item) => !item.requireAuth || user);

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <ul className={`navbar-menu ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`navbar-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="navbar-label">{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        {user ? (
          <UserAccount
            user={user}
            onLogout={onLogout}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <div className="auth-section">
            <button
              className="login-btn"
              onClick={() => setCurrentPage("login")}
            >
              Zaloguj się
            </button>
            <button
              className="auth-btn"
              onClick={() => setCurrentPage("register")}
            >
              Zarejestruj się
            </button>
          </div>
        )}

        <button
          className="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
