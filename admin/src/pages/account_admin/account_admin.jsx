import React, { useState, useRef } from "react";
import "./account_admin.css";
import ApiService from "../../utils/api.js";

import AddPhotoIcon from "../../assets/icons/add_a_photo.svg";
import NoPhotoIcon from "../../assets/icons/no_photography.svg";
import VisibilityIcon from "../../assets/icons/visibility.svg";
import VisibilityOffIcon from "../../assets/icons/visibility_off.svg";

function AccountPage({ user, onDataSaved }) {
  const fileInputRef = useRef(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    image: user?.image || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Zdjęcie jest za duże! Maksymalnie 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm("Usunąć zdjęcie profilowe?")) {
      setFormData((prev) => ({ ...prev, image: "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getInitials = () => {
    const f = formData.firstName ? formData.firstName[0] : "";
    const l = formData.lastName ? formData.lastName[0] : "";
    return (f + l).toUpperCase();
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${ApiService.API_URL}/admin/profile`, {
        method: "PUT",
        headers: ApiService.getHeaders(),
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          image: formData.image,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Błąd aktualizacji");

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (onDataSaved) onDataSaved(updatedUser);

      setIsEditingProfile(false);
      alert("Profil został pomyślnie zaktualizowany.");
    } catch (error) {
      console.error(error);
      alert("Wystąpił błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Hasła nie są identyczne!");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://inzynierka-backend-1hrq.onrender.com/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Błąd zmiany hasła");
      alert("Hasło zmienione.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert("Błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const renderPasswordField = (label, name, placeholder, value) => (
    <div className="form-group">
      <label>{label}</label>
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          className="admin-input"
          placeholder={placeholder}
          value={value}
          onChange={handlePasswordChange}
        />
        <button
          type="button"
          className="password-toggle-icon"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
        >
          <img
            src={showPassword ? VisibilityOffIcon : VisibilityIcon}
            alt={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
            className="password-icon-img"
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-content-container">
      <div className="admin-page-header">
        <div>
          <h1>Ustawienia Konta</h1>
          <p>Zarządzaj swoim profilem i bezpieczeństwem</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-header">
            <h3>Dane profilowe</h3>
            <button
              className="action-btn btn-secondary btn-edit-profile"
              onClick={() => {
                if (isEditingProfile) {
                  setFormData({
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                    image: user?.image || "",
                  });
                }
                setIsEditingProfile(!isEditingProfile);
              }}
            >
              {isEditingProfile ? "Anuluj" : "Edytuj"}
            </button>
          </div>

          <div className="avatar-section">
            <div className="avatar-wrapper">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Avatar"
                  className="avatar-large"
                />
              ) : (
                <div className="avatar-placeholder-large">{getInitials()}</div>
              )}
              {isEditingProfile && (
                <div className="avatar-actions-overlay">
                  <button
                    type="button"
                    className="icon-btn-small btn-upload"
                    onClick={() => fileInputRef.current.click()}
                    title="Zmień zdjęcie"
                  >
                    <img src={AddPhotoIcon} alt="Dodaj" className="icon-svg" />
                  </button>

                  {formData.image && (
                    <button
                      type="button"
                      className="icon-btn-small btn-remove"
                      onClick={handleRemoveImage}
                      title="Usuń zdjęcie"
                    >
                      <img src={NoPhotoIcon} alt="Usuń" className="icon-svg" />
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden-file-input"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <span className="role-badge-large">Administrator</span>
          </div>

          {!isEditingProfile ? (
            <div className="profile-view-list">
              <div className="view-item">
                <span className="view-label">Imię</span>
                <span className="view-value">{user?.firstName}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Nazwisko</span>
                <span className="view-value">{user?.lastName}</span>
              </div>
              <div className="view-item">
                <span className="view-label">E-mail</span>
                <span className="view-value">{user?.email}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className="settings-form">
              <div className="form-group">
                <label>Imię</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Nazwisko</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>E-mail </label>
                <input
                  type="text"
                  className="admin-input"
                  value={user?.email}
                  disabled
                />
              </div>
              <button
                type="submit"
                className="action-btn btn-primary btn-change-password"
                disabled={loading}
              >
                {loading ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
            </form>
          )}
        </div>

        <div className="settings-card">
          <div className="card-header">
            <h3>Zmiana hasła</h3>
          </div>

          <form
            onSubmit={handlePasswordSave}
            className="settings-form form-push-bottom"
          >
            {renderPasswordField(
              "Obecne hasło",
              "currentPassword",
              "Podaj obecne hasło",
              passwordData.currentPassword,
            )}
            {renderPasswordField(
              "Nowe hasło",
              "newPassword",
              "Minimum 6 znaków",
              passwordData.newPassword,
            )}
            {renderPasswordField(
              "Potwierdź hasło",
              "confirmPassword",
              "Powtórz nowe hasło",
              passwordData.confirmPassword,
            )}

            <button
              type="submit"
              className="action-btn btn-primary btn-change-password"
              disabled={
                loading ||
                !passwordData.newPassword ||
                !passwordData.currentPassword
              }
            >
              {loading ? "Przetwarzanie..." : "Zmień hasło"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
