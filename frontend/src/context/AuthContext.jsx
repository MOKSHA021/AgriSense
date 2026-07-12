/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("agrisense_user")) || null
  );

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("agrisense_user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("agrisense_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
