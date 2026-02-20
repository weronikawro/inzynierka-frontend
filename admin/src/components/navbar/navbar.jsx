import React, { useState } from "react";
import "./navbar.css";

import SettingsIcon from "../../assets/icons/settings_account.svg";
import LogoutIcon from "../../assets/icons/logout.svg";

function UserAccountInfo({ user }) {
  const getInitials = (firstName = "", lastName = "") => {
    const first = firstName ? firstName.charAt(0) : "";
    const last = lastName ? lastName.charAt(0) : "";
    return `${first}${last}`.toUpperCase();
  };

  if (!user) return null;

  const roleLabel = user.role === "admin" ? "Administrator" : "Użytkownik";

  return (
    <div className="user-info-row">
      <div className="nav-avatar">
        {user.image ? (
          <img src={user.image} alt="Avatar" className="nav-avatar-img" />
        ) : (
          getInitials(user.firstName || "", user.lastName || "") || "A"
        )}
      </div>

      <div className="nav-user-info">
        <span className="nav-name">
          {user.firstName
            ? `${user.firstName} ${user.lastName || ""}`
            : user.email}
        </span>
        <span className="nav-email">{roleLabel}</span>
      </div>
    </div>
  );
}

const Navbar = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminMenuItems = [
    { id: "home", label: "Panel główny" },
    { id: "products", label: "Produkty" },
    { id: "recipes", label: "Przepisy" },
    { id: "articles", label: "Artykuły" },
    { id: "users", label: "Użytkownicy" },
  ];

  const userMenuItems = [
    { id: "home", label: "Strona główna", requireAuth: false },
    { id: "diary", label: "Dziennik", requireAuth: true },
    { id: "diet", label: "Diety", requireAuth: false },
    { id: "recipes", label: "Przepisy", requireAuth: false },
    { id: "articles", label: "Artykuły", requireAuth: false },
  ];

  const isAdmin = user && user.role === "admin";

  let menuItems = [];
  if (isAdmin) {
    menuItems = adminMenuItems;
  } else {
    menuItems = userMenuItems.filter((item) => !item.requireAuth || user);
  }

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        ☰
      </button>

      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-user-section">
          <UserAccountInfo user={user} />
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`menu-item ${currentPage === item.id ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="footer-separator"></div>

          <div className="user-actions-row">
            <button
              className="user-action-btn"
              onClick={() => handleNavClick("account")}
              title="Ustawienia konta"
            >
              <img src={SettingsIcon} alt="" className="nav-icon-svg" />
              <span>Ustawienia</span>
            </button>

            <button
              className="user-action-btn logout"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLogout();
              }}
              title="Wyloguj się"
            >
              <img src={LogoutIcon} alt="" className="nav-icon-svg" />
              <span>Wyloguj</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
