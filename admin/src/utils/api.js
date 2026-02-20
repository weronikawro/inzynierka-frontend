class ApiService {
  static API_URL = "https://inzynierka-backend-1hrq.onrender.com/api";

  static getToken() {
    return localStorage.getItem("token");
  }

  static getHeaders(isFormData = false) {
    const headers = {};
    const token = this.getToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
    }

    return headers;
  }

  static async handleResponse(response) {
    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = {
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: responseText,
        };
      }
      throw new Error(errorData.error || "Wystąpił błąd sieci");
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      return responseText;
    }
  }

  // ------------------------------
  //          Autoryzacja
  // ------------------------------

  static async login(email, password) {
    const requestBody = { email: email.trim(), password: password.trim() };

    try {
      const adminResponse = await fetch(`${this.API_URL}/auth/login-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (adminResponse.ok) {
        const data = await adminResponse.json();
        if (data.user.role === "admin") {
          this._saveSession(data);
          return data;
        }
      }

      const userResponse = await fetch(`${this.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (userResponse.ok) {
        throw new Error("Nie jesteś administratorem! Dostęp zabroniony.");
      }

      throw new Error("Nieprawidłowy email lub hasło.");
    } catch (err) {
      throw err;
    }
  }

  static async register(userData) {
    let endpoint = "/auth/register";
    if (userData.adminCode && userData.adminCode.trim() !== "") {
      endpoint = "/auth/register-admin";
    }

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await this.handleResponse(response);
    this._saveSession(data);
    return data;
  }

  static _saveSession(data) {
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }

  static async verifyToken() {
    try {
      const response = await fetch(`${this.API_URL}/auth/verify`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  }

  // ------------------------------
  //    Dashboard i statystyki
  // ------------------------------

  static async getAdminStats() {
    const response = await fetch(`${this.API_URL}/admin/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getAdminMonthlyStats(month, year) {
    const query = `?month=${month}&year=${year}`;
    const response = await fetch(
      `${this.API_URL}/admin/stats/monthly${query}`,
      { headers: this.getHeaders() },
    );
    return this.handleResponse(response);
  }

  static async getDashboardRecent() {
    const response = await fetch(`${this.API_URL}/admin/dashboard/recent`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ------------------------------
  //         Użytkownicy
  // ------------------------------

  static async getUsers() {
    const response = await fetch(`${this.API_URL}/admin/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async deleteUser(userId) {
    const response = await fetch(`${this.API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ------------------------------
  //           Produkty
  // ------------------------------

  static async getProducts() {
    const response = await fetch(`${this.API_URL}/products`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async addProduct(productData) {
    const response = await fetch(`${this.API_URL}/products`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify(productData),
    });
    return this.handleResponse(response);
  }

  static async updateProduct(id, productData) {
    const response = await fetch(`${this.API_URL}/products/${id}`, {
      method: "PUT",
      headers: this.getHeaders(false),
      body: JSON.stringify(productData),
    });
    return this.handleResponse(response);
  }

  static async deleteProduct(id) {
    const response = await fetch(`${this.API_URL}/products/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ------------------------------
  //          Przepisy
  // ------------------------------

  static async getRecipes() {
    const response = await fetch(`${this.API_URL}/recipes`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async addRecipe(recipeData) {
    const isFormData = recipeData instanceof FormData;
    const response = await fetch(`${this.API_URL}/recipes`, {
      method: "POST",
      headers: this.getHeaders(isFormData),
      body: isFormData ? recipeData : JSON.stringify(recipeData),
    });
    return this.handleResponse(response);
  }

  static async updateRecipe(recipeId, recipeData) {
    const isFormData = recipeData instanceof FormData;
    const response = await fetch(`${this.API_URL}/recipes/${recipeId}`, {
      method: "PUT",
      headers: this.getHeaders(isFormData),
      body: isFormData ? recipeData : JSON.stringify(recipeData),
    });
    return this.handleResponse(response);
  }

  static async deleteRecipe(recipeId) {
    const response = await fetch(`${this.API_URL}/recipes/${recipeId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ------------------------------
  //          Artykuły
  // ------------------------------

  static async getArticles() {
    const response = await fetch(`${this.API_URL}/articles`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async addArticle(articleData) {
    const response = await fetch(`${this.API_URL}/articles`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify(articleData),
    });
    return this.handleResponse(response);
  }

  static async updateArticle(id, articleData) {
    const response = await fetch(`${this.API_URL}/articles/${id}`, {
      method: "PUT",
      headers: this.getHeaders(false),
      body: JSON.stringify(articleData),
    });
    return this.handleResponse(response);
  }

  static async deleteArticle(articleId) {
    const response = await fetch(`${this.API_URL}/articles/${articleId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async requestAdminPasswordReset(email) {
    const response = await fetch(`${this.API_URL}/auth/forgot-password-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  static async resetAdminPassword(token, newPassword) {
    const response = await fetch(`${this.API_URL}/auth/reset-password-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });
    return this.handleResponse(response);
  }

  // ------------------------------
  //          Profil
  // ------------------------------

  static async updateAdminProfile(profileData) {
    const response = await fetch(`${this.API_URL}/admin/profile`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }
}

export default ApiService;
