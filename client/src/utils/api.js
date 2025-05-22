import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Track if we're already handling a session expiration to prevent multiple alerts
let isHandlingSessionExpiration = false;

// Function to check if token is expired
const isTokenExpired = () => {
  const token = localStorage.getItem("token");
  if (!token) return true;
  
  try {
    // Get the expiration timestamp from the token
    // JWT tokens are in three parts: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    console.error("Error parsing token:", e);
    return true; // If there's an error, assume the token is expired
  }
};

// Handle session expiration
const handleSessionExpiration = () => {
  if (isHandlingSessionExpiration) return;
  
  isHandlingSessionExpiration = true;
  
  // Show a user-friendly message
  toast.error("Your session has expired. Please log in again.", {
    duration: 5000,
    id: "session-expired" // Use an ID to prevent duplicate toasts
  });
  
  console.warn("Session expired. Logging out...");
  
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
};

// Add token to request if available and check if it's expired
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Check if token is expired before making the request
      if (isTokenExpired()) {
        handleSessionExpiration();
        // Return a rejected promise to prevent the request from being made
        return Promise.reject(new Error("Token expired"));
      }
      
      // Token is valid, proceed with the request
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
    // Check specifically for authentication errors
    if (error.response?.status === 401) {
      handleSessionExpiration();
    }

    return Promise.reject(error);
  }
);

export default api;