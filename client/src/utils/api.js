import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out...");
      
      // ⚡ Remove token and user
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ⚡ Important: reload the page ONCE to reset app state
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
