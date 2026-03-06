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

export default API;
