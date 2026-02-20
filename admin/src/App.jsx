import { useState, useEffect } from "react";
import Navbar from "./components/navbar/navbar";
import LoginPage from "./components/auth_modal/login";
import RegisterPage from "./components/auth_modal/register";
import ForgotPasswordPage from "./components/auth_modal/forgot_password";
import ResetPasswordPage from "./components/auth_modal/reset_password";

import RecipesPage from "./pages/recipes_admin/recipes_admin";
import HomePage from "./pages/home_admin/home_admin";
import AccountPage from "./pages/account_admin/account_admin";
import ProductsPage from "./pages/products_admin/products_admin";
import ArticlesPage from "./pages/articles_admin/articles_admin";
import UsersPage from "./pages/users_admin/users_admin";
import SuccessMessage from "./components/auth_modal/success_message";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [navigationData, setNavigationData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    const tokenParam = params.get("token");

    if (pageParam === "reset-password" && tokenParam) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setCurrentPage("reset-password");
      setNavigationData(tokenParam);
      return;
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setCurrentPage("login");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("login");
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentPage("home");
    setSuccessMessage("Konto zostało utworzone.");
    setShowSuccessMessage(true);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    const requiresUser = [
      "home",
      "products",
      "recipes",
      "account",
      "articles",
      "users",
    ];

    if (requiresUser.includes(currentPage) && !user) {
      return (
        <LoginPage
          onLogin={handleLogin}
          onRegisterClick={() => setCurrentPage("register")}
          onForgotPassword={() => setCurrentPage("forgot-password")}
        />
      );
    }

    switch (currentPage) {
      case "home":
        return <HomePage user={user} onNavigate={handleNavigate} />;
      case "products":
        return <ProductsPage user={user} />;
      case "recipes":
        return <RecipesPage user={user} />;
      case "articles":
        return <ArticlesPage user={user} />;
      case "users":
        return <UsersPage user={user} />;
      case "account":
        return <AccountPage user={user} onDataSaved={handleUserUpdate} />;

      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onRegisterClick={() => setCurrentPage("register")}
            onForgotPassword={() => setCurrentPage("forgot-password")} // Przekazanie nawigacji
          />
        );
      case "register":
        return (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onLoginClick={() => setCurrentPage("login")}
          />
        );

      case "forgot-password":
        return (
          <ForgotPasswordPage onLoginClick={() => setCurrentPage("login")} />
        );
      case "reset-password":
        return (
          <ResetPasswordPage
            token={navigationData}
            onLoginClick={() => setCurrentPage("login")}
          />
        );

      default:
        return <HomePage user={user} onNavigate={handleNavigate} />;
    }
  };

  const isAuthPage = [
    "login",
    "register",
    "forgot-password",
    "reset-password",
  ].includes(currentPage);

  return (
    <div className="app-container">
      {user && !isAuthPage && (
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <main
        className={user && !isAuthPage ? "main-content" : "full-width-content"}
      >
        {renderCurrentPage()}
      </main>

      {showSuccessMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setShowSuccessMessage(false)}
        />
      )}
    </div>
  );
}

export default App;
