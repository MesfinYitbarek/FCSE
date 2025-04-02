import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Use environment variable
  headers: { "Content-Type": "application/json" },
});

// Add interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and other errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Response error:", error.response);

    if (error.response?.status === 401) {
      console.warn("Token expired or invalid");
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } else if (error.response?.status === 500) {
      alert("Something went wrong on the server. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
