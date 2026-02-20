import React, { useState } from "react";
import ApiService from "../../utils/api.js";
import VisibilityIcon from "../../assets/icons/visibility.svg";
import VisibilityOffIcon from "../../assets/icons/visibility_off.svg";
import "./forms.css";

function RegisterPage({ onRegisterSuccess, onLoginClick }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne");
      setLoading(false);
      return;
    }

    if (!formData.adminCode || formData.adminCode.trim() === "") {
      setError("Kod administratora jest wymagany!");
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName: formData.userName || formData.firstName,
        email: formData.email,
        password: formData.password,
        adminCode: formData.adminCode,
      };

      const result = await ApiService.register(registrationData);
      onRegisterSuccess(result.user);
    } catch (err) {
      setError(err.message || "Błąd rejestracji");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Rejestracja</h1>
          <p>Utwórz konto administratora</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-styled">
          <div className="form-group-styled">
            <label className="label-uppercase">Imię</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  firstName: e.target.value,
                  userName: e.target.value,
                })
              }
              required
              className="input-styled"
              placeholder="Twoje imię"
            />
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Nazwisko</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
              className="input-styled"
              placeholder="Twoje nazwisko"
            />
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Adres E-mail</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="input-styled"
              placeholder="Twój adres e-mail"
            />
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Hasło</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="input-styled"
                placeholder="Minimum 6 znaków"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <img
                  src={showPassword ? VisibilityOffIcon : VisibilityIcon}
                  alt="Widoczność"
                  className="icon-svg"
                />
              </button>
            </div>
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Potwierdź hasło</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                className="input-styled"
                placeholder="Powtórz hasło"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                <img
                  src={showConfirmPassword ? VisibilityOffIcon : VisibilityIcon}
                  alt="Widoczność"
                  className="icon-svg"
                />
              </button>
            </div>
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase label-danger">
              Kod Administratora
            </label>
            <div className="password-input-container">
              <input
                type={showAdminCode ? "text" : "password"}
                value={formData.adminCode}
                onChange={(e) =>
                  setFormData({ ...formData, adminCode: e.target.value })
                }
                required
                className="input-styled"
                placeholder="Wprowadź kod autoryzacyjny"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowAdminCode(!showAdminCode)}
                tabIndex="-1"
              >
                <img
                  src={showAdminCode ? VisibilityOffIcon : VisibilityIcon}
                  alt="Widoczność"
                  className="icon-svg"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`auth-btn-primary ${loading ? "btn-loading" : ""}`}
          >
            {loading ? "Rejestrowanie..." : "Zarejestruj się"}
          </button>

          <div className="auth-footer-link">
            <p>
              Masz już konto?{" "}
              <button type="button" onClick={onLoginClick}>
                Zaloguj się
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
