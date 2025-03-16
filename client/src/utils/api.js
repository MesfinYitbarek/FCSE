import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust as needed
  headers: { "Content-Type": "application/json" },
});

// Add interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Use backticks for template string
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
  (response) => {
    return response;
  },
  (error) => {
    console.error("Response error:", error.response);

    // Handle token expiration
    if (error.response?.status === 401) {
      console.warn("Token expired or invalid");
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token"); // Clear invalid token
      localStorage.removeItem("user"); // Clear user data
      window.location.href = "/login"; // Redirect to login page
    }

    // Handle server errors (500)
    else if (error.response?.status === 500) {
      alert("Something went wrong on the server. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
