import React, { useState } from "react";
import ApiService from "../../utils/api.js";
import "../../components/auth_modal/forms.css";

function DataPage({ user, onDataSaved }) {
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "",
    activityLevel: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const blockInvalidChar = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const validateField = (name, value) => {
    const errors = {};
    switch (name) {
      case "age": {
        const ageNum = parseInt(value);
        if (!value) errors.age = "Wiek jest wymagany";
        else if (ageNum < 0) errors.age = "Wiek nie może być ujemny";
        else if (isNaN(ageNum) || ageNum < 10 || ageNum > 120)
          errors.age = "10 - 120 lat";
        break;
      }
      case "height": {
        const heightNum = parseFloat(value);
        if (!value) errors.height = "Wzrost wymagany";
        else if (heightNum < 0) errors.height = "Wzrost nie może być ujemny";
        else if (isNaN(heightNum) || heightNum < 100 || heightNum > 250)
          errors.height = "100 - 250 cm";
        break;
      }
      case "weight": {
        const weightNum = parseFloat(value);
        if (!value) errors.weight = "Waga wymagana";
        else if (weightNum < 0) errors.weight = "Waga nie może być ujemna";
        else if (isNaN(weightNum) || weightNum < 30 || weightNum > 300)
          errors.weight = "30 - 300 kg";
        break;
      }
      case "gender":
        if (!value) errors.gender = "Wybierz płeć";
        break;
      case "activityLevel":
        if (!value) errors.activityLevel = "Wybierz aktywność";
        break;
      default:
        break;
    }
    return errors;
  };

  const validateForm = () => {
    let allErrors = {};
    Object.keys(formData).forEach((field) => {
      const fieldValidation = validateField(field, formData[field]);
      allErrors = { ...allErrors, ...fieldValidation };
    });
    setFieldErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (value < 0) return;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const cleanData = {
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
      };

      const result = await ApiService.saveBMIData(cleanData);
      if (onDataSaved) {
        onDataSaved(result.bmiData);
      }
    } catch (err) {
      console.error("Błąd zapisu:", err);
      setError(err.message || "Błąd podczas zapisu danych");
    } finally {
      setLoading(false);
    }
  };

  const getSelectStyle = (value) => ({
    color: value ? "#2d3748" : "#a0aec0",
    cursor: "pointer",
  });

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Uzupełnij profil</h1>
          <p>
            Potrzebujemy tych danych, aby obliczyć Twoje zapotrzebowanie
            kaloryczne.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-styled">
          <div className="form-group-styled">
            <label className="label-uppercase">Wiek (lat)</label>
            <input
              type="number"
              name="age"
              min="0"
              onKeyDown={blockInvalidChar}
              className="input-styled"
              placeholder="Twój wiek"
              value={formData.age}
              onChange={handleInputChange}
            />
            {fieldErrors.age && (
              <span className="field-error-text">{fieldErrors.age}</span>
            )}
          </div>

          <div className="form-grid-2col">
            <div className="form-group-styled">
              <label className="label-uppercase">Wzrost (cm)</label>
              <input
                type="number"
                name="height"
                min="0"
                onKeyDown={blockInvalidChar}
                className="input-styled"
                placeholder="Twój wzrost"
                value={formData.height}
                onChange={handleInputChange}
              />
              {fieldErrors.height && (
                <span className="field-error-text">{fieldErrors.height}</span>
              )}
            </div>

            <div className="form-group-styled">
              <label className="label-uppercase">Waga (kg)</label>
              <input
                type="number"
                name="weight"
                step="0.1"
                min="0"
                onKeyDown={blockInvalidChar}
                className="input-styled"
                placeholder="Twoja waga"
                value={formData.weight}
                onChange={handleInputChange}
              />
              {fieldErrors.weight && (
                <span className="field-error-text">{fieldErrors.weight}</span>
              )}
            </div>
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Płeć</label>
            <select
              name="gender"
              className={`input-styled ${formData.gender ? "value-active" : "placeholder-active"}`}
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="" disabled hidden>
                Wybierz płeć...
              </option>
              <option value="male">Mężczyzna</option>
              <option value="female">Kobieta</option>
            </select>
            {fieldErrors.gender && (
              <span className="field-error-text">{fieldErrors.gender}</span>
            )}
          </div>

          <div className="form-group-styled">
            <label className="label-uppercase">Poziom aktywności</label>
            <select
              name="activityLevel"
              className={`input-styled ${formData.activityLevel ? "value-active" : "placeholder-active"}`}
              value={formData.activityLevel}
              onChange={handleInputChange}
            >
              <option value="" disabled hidden>
                Jak wygląda Twój dzień?
              </option>
              <option value="sedentary">Brak aktywności (praca biurowa)</option>
              <option value="lightly_active">
                Lekka aktywność (1-3 treningi/tydz.)
              </option>
              <option value="moderately_active">
                Umiarkowana (3-5 treningów/tydz.)
              </option>
              <option value="very_active">
                Duża aktywność (6-7 treningów/tydz.)
              </option>
              <option value="extremely_active">
                Bardzo duża (praca fizyczna + treningi)
              </option>
            </select>
            {fieldErrors.activityLevel && (
              <span className="field-error-text">
                {fieldErrors.activityLevel}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`auth-btn-primary ${loading ? "btn-loading" : ""}`}
          >
            {loading ? "Przeliczanie..." : "Oblicz BMI i Kalorie"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DataPage;
