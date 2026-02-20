import React, { useState } from "react";
import ApiService from "../../utils/api.js";
import "./forms.css";

function ForgotPasswordPage({ onLoginClick }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await ApiService.requestAdminPasswordReset(email);
      setMessage("Link został wysłany.");
    } catch (err) {
      setError("Wystąpił błąd. Spróbuj ponownie później.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {message ? (
          <div className="auth-success-view">
            <h2>Sprawdź skrzynkę</h2>
            <p>
              Jeśli podany adres e-mail ({email}) jest przypisany do
              administratora, wysłaliśmy na niego link do resetu hasła.
            </p>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h1>Reset hasła</h1>
              <p>Podaj e-mail powiązany z kontem Administratora</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form-styled">
              <div className="form-group-styled">
                <label className="label-uppercase">Adres E-mail</label>

                <input
                  type="email"
                  className="input-styled"
                  placeholder="Twój adres e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`auth-btn-primary ${loading ? "btn-loading" : ""}`}
              >
                {loading ? "Wysyłanie..." : "Wyślij link"}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer-link">
          <p>
            Pamiętasz hasło?{" "}
            <button type="button" onClick={onLoginClick}>
              Wróć do logowania
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
