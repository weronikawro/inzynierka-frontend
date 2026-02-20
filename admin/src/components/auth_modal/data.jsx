import React, { useState } from "react";
import ApiService from "../../utils/api.js";

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

  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case "age": {
        const ageNum = parseInt(value);
        if (!value) {
          errors.age = "Wiek jest wymagany";
        } else if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
          errors.age = "Wiek musi być między 10 a 120 lat";
        }
        break;
      }

      case "height": {
        const heightNum = parseFloat(value);
        if (!value) {
          errors.height = "Wzrost jest wymagany";
        } else if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
          errors.height = "Wzrost musi być między 100 a 250 cm";
        }
        break;
      }

      case "weight": {
        const weightNum = parseFloat(value);
        if (!value) {
          errors.weight = "Waga jest wymagany";
        } else if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
          errors.weight = "Waga musi być między 30 a 300 kg";
        }
        break;
      }

      case "gender":
        if (!value) errors.gender = "Płeć jest wymagana";
        break;

      case "activityLevel":
        if (!value) errors.activityLevel = "Poziom aktywności jest wymagany";
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      const validation = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validation[name] || null,
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value);

    setFieldErrors((prev) => ({
      ...prev,
      ...validation,
    }));
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

  return (
    <div className="content-container-narrow">
      <div className="section-header">
        <h1>Dane do BMI i kalorii</h1>
        <p>Uzupełnij dane aby obliczyć BMI i zapotrzebowanie</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className={`form-group ${fieldErrors.age ? "has-error" : ""}`}>
          <label>Wiek</label>
          <input
            type="number"
            name="age"
            min="10"
            max="120"
            value={formData.age}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          {fieldErrors.age && (
            <div className="form-error">{fieldErrors.age}</div>
          )}
        </div>

        <div className="form-row-group">
          <div
            className={`form-group form-group-flex ${fieldErrors.height ? "has-error" : ""}`}
          >
            <label>Wzrost (cm)</label>
            <input
              type="number"
              name="height"
              min="100"
              max="250"
              value={formData.height}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
            {fieldErrors.height && (
              <div className="form-error">{fieldErrors.height}</div>
            )}
          </div>

          <div
            className={`form-group form-group-flex ${fieldErrors.weight ? "has-error" : ""}`}
          >
            <label>Waga (kg)</label>
            <input
              type="number"
              name="weight"
              min="30"
              max="300"
              step="0.1"
              value={formData.weight}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
            {fieldErrors.weight && (
              <div className="form-error">{fieldErrors.weight}</div>
            )}
          </div>
        </div>

        <div className={`form-group ${fieldErrors.gender ? "has-error" : ""}`}>
          <label>Płeć</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="">Wybierz</option>
            <option value="male">Mężczyzna</option>
            <option value="female">Kobieta</option>
          </select>
          {fieldErrors.gender && (
            <div className="form-error">{fieldErrors.gender}</div>
          )}
        </div>

        <div
          className={`form-group ${
            fieldErrors.activityLevel ? "has-error" : ""
          }`}
        >
          <label>Poziom aktywności</label>
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleInputChange}
          >
            <option value="">Wybierz</option>
            <option value="sedentary">Brak aktywności</option>
            <option value="lightly_active">Lekka aktywność</option>
            <option value="moderately_active">Umiarkowana</option>
            <option value="very_active">Wysoka</option>
            <option value="extremely_active">Bardzo wysoka</option>
          </select>
          {fieldErrors.activityLevel && (
            <div className="form-error">{fieldErrors.activityLevel}</div>
          )}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? "Liczenie..." : "Oblicz BMI i kalorie"}
        </button>
      </form>
    </div>
  );
}

export default DataPage;
