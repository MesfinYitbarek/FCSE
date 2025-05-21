import axios from "axios";
import { toast } from "react-hot-toast"; // Make sure you have this imported

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

// Track if we're already handling a session expiration to prevent multiple alerts
let isHandlingSessionExpiration = false;

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check specifically for authentication errors
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || "";
      
      // Only handle session expiration once to prevent multiple modals/redirects
      if (!isHandlingSessionExpiration) {
        isHandlingSessionExpiration = true;

        // Show a user-friendly message
        toast.error("Your session has expired. Please log in again.", {
          duration: 5000,
          id: "session-expired" // Use an ID to prevent duplicate toasts
        });
        
        console.warn("Session expired. Logging out...", errorMessage);
        
        // Save current path for potential redirect after login
        const currentPath = window.location.pathname;
        if (currentPath !== "/" && currentPath !== "/login") {
          localStorage.setItem("redirectAfterLogin", currentPath);
        }
        
        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Dispatch a custom event that the Layout component will listen for
        const sessionExpiredEvent = new CustomEvent('sessionExpired');
        window.dispatchEvent(sessionExpiredEvent);
        
        // Reset the flag after a short delay to allow for the event to be processed
        setTimeout(() => {
          isHandlingSessionExpiration = false;
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

export default api;