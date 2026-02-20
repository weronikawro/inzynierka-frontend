import React, { useState, useRef } from "react";
import ApiService from "../../utils/api.js";
import "./account.css";

import AddPhotoIcon from "../../assets/icons/add_a_photo.svg";
import NoPhotoIcon from "../../assets/icons/no_photography.svg";
import VisibilityIcon from "../../assets/icons/visibility.svg";
import VisibilityOffIcon from "../../assets/icons/visibility_off.svg";

function AccountPage({ user, onDataSaved }) {
  const fileInputRef = useRef(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    image: user?.image || "",
    weight: user?.bmiData?.weight || "",
    height: user?.bmiData?.height || "",
    age: user?.bmiData?.age || "",
    gender: user?.bmiData?.gender || "male",
    activityLevel: user?.bmiData?.activityLevel || "sedentary",
  });

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const initialWeight =
    user?.bmiData?.initialWeight || user?.bmiData?.weight || 0;
  const currentWeight = user?.bmiData?.weight || 0;
  const weightDiff = (currentWeight - initialWeight).toFixed(1);

  const genderLabels = { male: "Mężczyzna", female: "Kobieta" };
  const activityLabels = {
    sedentary: "Siedzący",
    lightly_active: "Niska aktywność",
    moderately_active: "Umiarkowana",
    very_active: "Wysoka aktywność",
    extremely_active: "Ekstremalna",
  };
  const bmiLabels = {
    underweight: "Niedowaga",
    normal: "Norma",
    overweight: "Nadwaga",
    obese: "Otyłość",
  };

  const getInitials = () => {
    const f = formData.firstName ? formData.firstName[0] : "";
    const l = formData.lastName ? formData.lastName[0] : "";
    return (f + l).toUpperCase();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm("Usunąć zdjęcie profilowe?")) {
      setFormData((prev) => ({ ...prev, image: "" }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await ApiService.saveBMIData({
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
      });

      const updatedUser = {
        ...user,
        bmiData: result.bmiData,
        profileComplete: true,
      };

      if (formData.firstName.trim() !== "")
        updatedUser.firstName = formData.firstName;
      if (formData.lastName.trim() !== "")
        updatedUser.lastName = formData.lastName;
      if (formData.image !== "") updatedUser.image = formData.image;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (onDataSaved) onDataSaved(updatedUser);
      setIsEditingProfile(false);
      alert("Dane profilowe zostały zaktualizowane!");
    } catch (error) {
      alert("Błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Hasła nie są identyczne!");
      return;
    }
    setLoading(true);
    try {
      await ApiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert("Hasło zostało zmienione.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordPanel(false);
    } catch (error) {
      alert("Błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeight = async (e) => {
    e.preventDefault();
    const weightValue = parseFloat(newWeight);
    if (!newWeight || isNaN(weightValue)) return;
    setLoading(true);
    try {
      const result = await ApiService.updateBMIData({
        ...formData,
        weight: weightValue,
      });
      const updatedUser = { ...user, bmiData: result.bmiData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (onDataSaved) onDataSaved(updatedUser);
      setFormData((prev) => ({ ...prev, weight: weightValue }));
      setShowWeightModal(false);
      setNewWeight("");
      alert("Waga została zaktualizowana!");
    } catch (error) {
      alert("Błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (label, name, placeholder, value) => (
    <div className="form-field">
      <label>{label}</label>
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={(e) =>
            setPasswordData({ ...passwordData, [name]: e.target.value })
          }
          placeholder={placeholder}
          className="form-input"
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
        >
          <img
            src={showPassword ? VisibilityOffIcon : VisibilityIcon}
            alt="Toggle"
            className="password-icon"
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="account-container">
      <div
        className={`account-content-wrapper ${showPasswordPanel ? "with-sidebar" : "single-column"}`}
      >
        <div className="main-stack">
          <div className="account-card">
            <div className="account-header">
              <h2>Twój profil</h2>
              <div className="header-actions">
                <button
                  className={`edit-btn ${showPasswordPanel ? "active" : ""}`}
                  onClick={() => setShowPasswordPanel(!showPasswordPanel)}
                >
                  Zmień hasło
                </button>
                <button
                  className={`edit-btn ${isEditingProfile ? "active" : ""}`}
                  onClick={() => {
                    setIsEditingProfile(!isEditingProfile);
                    if (!isEditingProfile) setShowPasswordPanel(false);
                  }}
                >
                  {isEditingProfile ? "Anuluj edycję" : "Edytuj profil"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="account-form">
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Avatar"
                      className="avatar-large"
                    />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {getInitials()}
                    </div>
                  )}
                  {isEditingProfile && (
                    <div className="avatar-actions-overlay">
                      <button
                        type="button"
                        className="icon-btn-small btn-upload"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <img
                          src={AddPhotoIcon}
                          alt="Dodaj"
                          className="icon-svg"
                        />
                      </button>
                      {formData.image && (
                        <button
                          type="button"
                          className="icon-btn-small btn-remove"
                          onClick={handleRemoveImage}
                        >
                          <img
                            src={NoPhotoIcon}
                            alt="Usuń"
                            className="icon-svg"
                          />
                        </button>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {isEditingProfile ? (
                <>
                  <div className="form-field">
                    <label>Imię</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label>Nazwisko</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <hr className="form-divider" />
                  <h3 className="section-subtitle">Parametry zdrowotne</h3>

                  <div className="form-grid-row">
                    <div className="form-field">
                      <label>Waga (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Wzrost (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Wiek</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Płeć</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="male">Mężczyzna</option>
                        <option value="female">Kobieta</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Aktywność</label>
                    <select
                      name="activityLevel"
                      value={formData.activityLevel}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="sedentary">Siedzący</option>
                      <option value="lightly_active">Niska aktywność</option>
                      <option value="moderately_active">Umiarkowana</option>
                      <option value="very_active">Wysoka aktywność</option>
                    </select>
                  </div>
                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? "Zapisywanie..." : "Zapisz zmiany"}
                  </button>
                </>
              ) : (
                <div className="info-grid">
                  <div className="info-item">
                    <span>Imię</span> <strong>{user?.firstName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Nazwisko</span> <strong>{user?.lastName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Email</span> <strong>{user?.email}</strong>
                  </div>
                </div>
              )}
            </form>
          </div>

          {!isEditingProfile && (
            <div className="account-card">
              <div className="account-header">
                <h2>Twoje dane</h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span>Waga</span> <strong>{user?.bmiData?.weight} kg</strong>
                </div>
                <div className="info-item">
                  <span>Wzrost</span>{" "}
                  <strong>{user?.bmiData?.height} cm</strong>
                </div>
                <div className="info-item">
                  <span>Wiek</span> <strong>{user?.bmiData?.age} lat</strong>
                </div>
                <div className="info-item">
                  <span>Płeć</span>{" "}
                  <strong>
                    {genderLabels[user?.bmiData?.gender] ||
                      user?.bmiData?.gender}
                  </strong>
                </div>
                <div className="info-item info-item-full">
                  <span>Aktywność</span>
                  <strong>
                    {activityLabels[user?.bmiData?.activityLevel] ||
                      user?.bmiData?.activityLevel}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {!isEditingProfile && (
            <div className="account-card">
              <div className="account-header">
                <h2>Waga</h2>
                <button
                  className="edit-btn"
                  onClick={() => setShowWeightModal(true)}
                >
                  + Dodaj aktualną wagę
                </button>
              </div>
              <div className="weight-analysis-grid">
                <div className="weight-box">
                  <span className="weight-label">Waga początkowa</span>
                  <span className="weight-value">{initialWeight} kg</span>
                </div>
                <div className="weight-box highlight">
                  <span className="weight-label">Obecna waga</span>
                  <span className="weight-value">{currentWeight} kg</span>
                </div>
                <div className="weight-box">
                  <span className="weight-label">Postęp</span>
                  <span
                    className={`weight-diff ${weightDiff < 0 ? "negative" : weightDiff > 0 ? "positive" : "neutral"}`}
                  >
                    {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isEditingProfile && (
            <div className="account-card">
              <div className="account-header">
                <h2>Zdrowie</h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span>BMI</span> <strong>{user?.bmiData?.bmi || "-"}</strong>
                </div>
                <div className="info-item">
                  <span>Kategoria</span>
                  <strong>
                    {bmiLabels[user?.bmiData?.bmiCategory] ||
                      user?.bmiData?.bmiCategory ||
                      "-"}
                  </strong>
                </div>
                <div className="info-item info-item-full">
                  <span>BMR</span>{" "}
                  <strong>{user?.bmiData?.bmr || 0} kcal</strong>
                </div>
              </div>
              <div className="nutrition-section">
                <h3>Zapotrzebowanie (TDEE)</h3>
                <div className="calories-display">
                  <span className="cal-value">{user?.bmiData?.tdee || 0}</span>
                  <span className="cal-unit">kcal</span>
                </div>
                <div className="macro-container">
                  <div className="macro-box">
                    <span className="macro-label">Białko</span>
                    <span className="macro-value">
                      {user?.bmiData?.protein || 0}g
                    </span>
                  </div>
                  <div className="macro-box">
                    <span className="macro-label">Tłuszcze</span>
                    <span className="macro-value">
                      {user?.bmiData?.fat || 0}g
                    </span>
                  </div>
                  <div className="macro-box">
                    <span className="macro-label">Węglowodany</span>
                    <span className="macro-value">
                      {user?.bmiData?.carbs || 0}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showWeightModal && (
          <div className="modal-overlay">
            <div className="modal-content-small">
              <div className="modal-header-small">
                <h3>Nowy pomiar wagi</h3>
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="close-modal-btn"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateWeight}>
                <div className="form-field">
                  <label className="modal-input-label">
                    Wpisz aktualną masę ciała (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    autoFocus
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowWeightModal(false)}
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="btn-confirm"
                    disabled={loading}
                  >
                    Zatwierdź
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPasswordPanel && (
          <div className="password-sidebar">
            <div className="account-card">
              <div className="account-header">
                <h2>Zmiana hasła</h2>
                <button
                  className="edit-btn sidebar-close-btn"
                  onClick={() => setShowPasswordPanel(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSavePassword} className="account-form">
                {renderPasswordField(
                  "Obecne hasło",
                  "currentPassword",
                  "Wpisz obecne hasło",
                  passwordData.currentPassword,
                )}
                {renderPasswordField(
                  "Nowe hasło",
                  "newPassword",
                  "Wpisz nowe hasło",
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
                  className="save-btn"
                  disabled={loading || !passwordData.currentPassword}
                >
                  {loading ? "Przetwarzanie..." : "Zmień hasło"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountPage;
