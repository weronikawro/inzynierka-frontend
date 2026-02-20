import React, { useState } from "react";
import ApiService from "../../utils/api.js";
import VisibilityIcon from "../../assets/icons/visibility.svg";
import VisibilityOffIcon from "../../assets/icons/visibility_off.svg";
import "./forms.css";

function RegisterPage({ onRegisterSuccess, onNavigate }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne");
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };

      const result = await ApiService.register(registrationData);
      onRegisterSuccess(result.user);
    } catch (err) {
      setError(err.message || "Błąd rejestracji. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Rejestracja</h1>
          <p>Utwórz nowe konto użytkownika</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-styled">
          <div className="form-group-styled">
            <label className="label-uppercase">Imię</label>
            <input
              type="text"
              name="firstName"
              className="input-styled"
              placeholder="Twoje imię"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Nazwisko</label>
            <input
              type="text"
              name="lastName"
              className="input-styled"
              placeholder="Twoje nazwisko"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Adres E-mail</label>
            <input
              type="email"
              name="email"
              className="input-styled"
              placeholder="Twój adres e-mail"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Hasło</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="input-styled"
                placeholder="Twoje hasło"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              >
                <img
                  src={showPassword ? VisibilityOffIcon : VisibilityIcon}
                  alt="Pokaż/Ukryj"
                />
              </button>
            </div>
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Potwierdź Hasło</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="input-styled"
                placeholder="Powtórz hasło"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
                title={showConfirmPassword ? "Ukryj hasło" : "Pokaż hasło"}
              >
                <img
                  src={showConfirmPassword ? VisibilityOffIcon : VisibilityIcon}
                  alt="Pokaż/Ukryj"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`auth-btn-primary ${loading ? "btn-loading" : ""}`}
          >
            {loading ? "Tworzenie konta..." : "Zarejestruj się"}
          </button>

          <div className="auth-footer-link">
            <p>
              Masz już konto?{" "}
              <button type="button" onClick={() => onNavigate("login")}>
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
