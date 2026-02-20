import React, { useState } from "react";
import ApiService from "../../utils/api.js";
import VisibilityIcon from "../../assets/icons/visibility.svg";
import VisibilityOffIcon from "../../assets/icons/visibility_off.svg";
import "./forms.css";

function LoginPage({ onLogin, onRegisterClick, onForgotPassword }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await ApiService.login(formData.email, formData.password);
      onLogin(result.user);
    } catch (err) {
      setError(err.message || "Błąd logowania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Witaj ponownie!</h1>
          <p>Zaloguj się do panelu administratora</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-styled">
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
                placeholder="Twoje hasło"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <img
                  src={showPassword ? VisibilityOffIcon : VisibilityIcon}
                  alt="Pokaż/ukryj hasło"
                  className="icon-svg"
                />
              </button>
            </div>
          </div>

          <div className="forgot-password-row">
            <button
              type="button"
              className="text-link-underline"
              onClick={onForgotPassword}
            >
              Nie pamiętam hasła
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`auth-btn-primary ${loading ? "btn-loading" : ""}`}
          >
            {loading ? "Weryfikacja..." : "Zaloguj się"}
          </button>

          <div className="auth-footer-link">
            <p>
              Nie masz konta?{" "}
              <button type="button" onClick={onRegisterClick}>
                Utwórz konto
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
