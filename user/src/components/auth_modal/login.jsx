import React, { useState } from "react";
import ApiService from "../../utils/api.js";
import VisibilityIcon from "../../assets/icons/visibility.svg";
import VisibilityOffIcon from "../../assets/icons/visibility_off.svg";
import "./forms.css";

function LoginPage({ onLogin, onNavigate }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await ApiService.login(formData.email, formData.password);
      onLogin(result.user);
    } catch (err) {
      setError(
        err.message || "Błąd logowania. Sprawdź dane i spróbuj ponownie.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Witaj ponownie!</h1>
          <p> Zaloguj się do swojego konta</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-styled">
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
          <div className="forgot-password-row">
            <button
              type="button"
              className="text-link-underline"
              onClick={() => onNavigate("forgot-password")}
            >
              Nie pamiętam hasła
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`auth-btn-primary ${loading ? "btn-loading" : ""}`}
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>

          <div className="auth-footer-link">
            <p>
              Nie masz konta?{" "}
              <button type="button" onClick={() => onNavigate("register")}>
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
