import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// ✅ ADD THIS — runs before every single API call
API.interceptors.request.use((config) => {
  const stored = localStorage.getItem("agrisense_user");
  if (stored) {
    const parsed = JSON.parse(stored);
    const token = parsed?.token;       // { token: "eyJ...", user: {...} }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ ADD THIS — Response Interceptor for Dual Tokens
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Ask backend for a new access token using the httpOnly refresh cookie
        const res = await axios.post("http://localhost:5000/api/auth/refresh", {}, { withCredentials: true });
        
        // Update local storage with new token
        const stored = localStorage.getItem("agrisense_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.token = res.data.token;
          localStorage.setItem("agrisense_user", JSON.stringify(parsed));
        }
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired/invalid. Force logout.
        localStorage.removeItem("agrisense_user");
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;
