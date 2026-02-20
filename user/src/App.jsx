import { useState, useEffect } from "react";
import Navbar from "./components/navbar/navbar";
import LoginPage from "./components/auth_modal/login";
import RegisterPage from "./components/auth_modal/register";
import ForgotPasswordPage from "./components/auth_modal/forgot_password";
import ResetPasswordPage from "./components/auth_modal/reset_password";
import DataPage from "./components/auth_modal/data";
import RecipesPage from "./pages/recipes/recipes";
import DiaryPage from "./pages/diary/diary";
import HomePage from "./pages/home/home";
import DietPage from "./pages/diet/diet";
import AccountPage from "./pages/account/account";
import ArticlesPage from "./pages/articles/articles";
import SuccessMessage from "./components/auth_modal/success_message";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("lastPage") || "home";
  });
  const [user, setUser] = useState(null);
  const [navigationData, setNavigationData] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
      setIsAuthLoading(false);
      return;
    }

    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await ApiService.verifyToken();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
          console.error("Błąd weryfikacji tokena:", err.message);
          if (err.status === 401 || err.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          } else {
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
          }
        }
      }
      setIsAuthLoading(false);
    };

    validateToken();
  }, []);

  useEffect(() => {
    if (
      currentPage !== "reset-password" &&
      user &&
      !user.profileComplete &&
      currentPage !== "data"
    ) {
      handleNavigate("data");
    }
  }, [user, currentPage]);

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    setNavigationData(data);
    localStorage.setItem("lastPage", page);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.profileComplete) {
      handleNavigate("home");
    } else {
      handleNavigate("data");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastPage");
    setUser(null);
    setCurrentPage("home");
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    handleNavigate("data");
  };

  const handleDataSaved = (bmiData) => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const updatedUser = { ...savedUser, bmiData, profileComplete: true };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    handleNavigate("home");
    setSuccessMessage(
      `Dane zostały zapisane! BMI: ${bmiData.bmi}, zapotrzebowanie: ${bmiData.tdee} kcal`,
    );
    setShowSuccessMessage(true);
  };

  const renderContent = () => {
    if (isAuthLoading) {
      return <div className="app-loading">Inicjalizacja...</div>;
    }

    if (!user) {
      switch (currentPage) {
        case "register":
          return (
            <RegisterPage
              onRegisterSuccess={handleRegisterSuccess}
              onNavigate={handleNavigate}
            />
          );
        case "forgot-password":
          return <ForgotPasswordPage onNavigate={handleNavigate} />;
        case "reset-password":
          return (
            <ResetPasswordPage
              token={navigationData}
              onNavigate={handleNavigate}
            />
          );

        case "home":
          return <HomePage user={null} onNavigate={handleNavigate} />;
        case "diet":
          return <DietPage user={null} />;
        case "recipes":
          return <RecipesPage user={null} />;
        case "articles":
          return <ArticlesPage user={null} initialData={navigationData} />;
        case "login":
        case "diary":
          return (
            <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />
          );

        default:
          return <HomePage user={null} onNavigate={handleNavigate} />;
      }
    }

    switch (currentPage) {
      case "home":
        return <HomePage user={user} onNavigate={handleNavigate} />;
      case "diary":
        return <DiaryPage user={user} />;
      case "diet":
        return <DietPage user={user} />;
      case "recipes":
        return <RecipesPage user={user} />;
      case "articles":
        return <ArticlesPage user={user} initialData={navigationData} />;
      case "account":
        return <AccountPage user={user} onDataSaved={(u) => setUser(u)} />;
      case "data":
        return <DataPage user={user} onDataSaved={handleDataSaved} />;
      default:
        return <HomePage user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app-container">
      {currentPage !== "data" && (
        <Navbar
          currentPage={currentPage}
          setCurrentPage={(page) => handleNavigate(page, null)}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <div className="app-content">{renderContent()}</div>

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
