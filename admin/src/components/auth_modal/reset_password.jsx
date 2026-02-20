import React, { useState } from "react";
import ApiService from "../../utils/api.js";
import VisibilityIcon from "../../assets/icons/visibility.svg";
import VisibilityOffIcon from "../../assets/icons/visibility_off.svg";
import "./forms.css";

function ResetPasswordPage({ token, onLoginClick }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ApiService.resetAdminPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Link wygasł lub jest nieprawidłowy.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Hasło zmienione!</h1>
            <p>Możesz się teraz zalogować do panelu admina.</p>
          </div>
          <button className="auth-btn-primary" onClick={onLoginClick}>
            Przejdź do logowania
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Nowe hasło</h1>
          <p>Ustaw nowe hasło administratora</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-styled">
          <div className="form-group-styled">
            <label className="label-uppercase">Nowe Hasło</label>
            <div className="password-input-container">
              <input
                type={showPass ? "text" : "password"}
                className="input-styled"
                placeholder="Minimum 6 znaków"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPass(!showPass)}
              >
                <img
                  src={showPass ? VisibilityOffIcon : VisibilityIcon}
                  alt="Oko"
                />
              </button>
            </div>
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Potwierdź Hasło</label>
            <div className="password-input-container">
              <input
                type={showConfirm ? "text" : "password"}
                className="input-styled"
                placeholder="Powtórz hasło"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <img
                  src={showConfirm ? VisibilityOffIcon : VisibilityIcon}
                  alt="Oko"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`auth-btn-primary ${loading ? "btn-loading" : ""}`}
          >
            {loading ? "Zmieniam..." : "Zmień hasło"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
