import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  const stored = localStorage.getItem("agrisense_user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const token = parsed?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      localStorage.removeItem("agrisense_user");
    }
  }
  return config;
});

export default API;
