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
      const error = new Error(errorData.error || "Network error");
      error.status = response.status;
      throw error;
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      throw new Error("Invalid JSON response from server");
    }
  }

  // ------------------------------
  //          Autoryzacja
  // ------------------------------

  static async login(email, password) {
    if (!email || !email.trim()) throw new Error("Email is required");
    if (!password || !password.trim()) throw new Error("Password is required");

    const requestBody = { email: email.trim(), password: password.trim() };
    const response = await fetch(`${this.API_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    });

    const data = await this.handleResponse(response);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  }

  static async register(userData) {
    const response = await fetch(`${this.API_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await this.handleResponse(response);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  }

  static async verifyToken() {
    try {
      const response = await fetch(`${this.API_URL}/auth/verify`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw error;
    }
  }

  // ------------------------------
  //           Profil
  // ------------------------------

  static async getUserProfile() {
    const response = await fetch(`${this.API_URL}/auth/verify`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async saveBMIData(bmiData) {
    const response = await fetch(`${this.API_URL}/user/bmi-data`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(bmiData),
    });
    return this.handleResponse(response);
  }

  static async getBMIData() {
    const response = await fetch(`${this.API_URL}/user/bmi-data`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateBMIData(bmiData) {
    const response = await fetch(`${this.API_URL}/user/bmi-data`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(bmiData),
    });
    return this.handleResponse(response);
  }

  static async changePassword(passwords) {
    const response = await fetch(`${this.API_URL}/user/change-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(passwords),
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
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });
    return this.handleResponse(response);
  }

  static async updateProduct(id, productData) {
    const response = await fetch(`${this.API_URL}/products/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
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
  //           Przepisy
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

  static async getRecipe(recipeId) {
    const response = await fetch(`${this.API_URL}/recipes/${recipeId}`, {
      headers: this.getHeaders(),
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

  static async searchRecipes(query) {
    const response = await fetch(
      `${this.API_URL}/recipes/search/${encodeURIComponent(query)}`,
      { headers: this.getHeaders() },
    );
    return this.handleResponse(response);
  }

  // ------------------------------
  //           Dziennik
  // ------------------------------

  static async getDiaryEntries(date) {
    const response = await fetch(`${this.API_URL}/diary/${date}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async addDiaryEntry(entryData) {
    const response = await fetch(`${this.API_URL}/diary`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(entryData),
    });
    return this.handleResponse(response);
  }

  static async updateDiaryEntry(entryId, entryData) {
    const response = await fetch(`${this.API_URL}/diary/${entryId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(entryData),
    });
    return this.handleResponse(response);
  }

  static async deleteDiaryEntry(entryId) {
    const response = await fetch(`${this.API_URL}/diary/${entryId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getDiaryStats(startDate, endDate) {
    const response = await fetch(
      `${this.API_URL}/diary/stats?start=${startDate}&end=${endDate}`,
      { headers: this.getHeaders() },
    );
    return this.handleResponse(response);
  }

  static async getDiarySummary(date) {
    const response = await fetch(`${this.API_URL}/diary/${date}/summary`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async healthCheck() {
    try {
      const response = await fetch(`${this.API_URL}/auth/verify`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error("Server is not responding");
    }
  }

  // ------------------------------
  //           Artykuły
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
      headers: this.getHeaders(),
      body: JSON.stringify(articleData),
    });
    return this.handleResponse(response);
  }

  static async updateArticle(articleId, articleData) {
    const response = await fetch(`${this.API_URL}/articles/${articleId}`, {
      method: "PUT",
      headers: this.getHeaders(),
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

  static async requestPasswordReset(email) {
    const response = await fetch(`${this.API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  static async resetPassword(token, newPassword) {
    const response = await fetch(`${this.API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });
    return this.handleResponse(response);
  }
}

export default ApiService;
