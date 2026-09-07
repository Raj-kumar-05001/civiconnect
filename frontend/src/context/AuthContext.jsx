import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("cc_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { session, user: loggedInUser } = await authService.login({ email, password });
    localStorage.setItem("cc_token", session.access_token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (name, email, password) => {
    await authService.register({ name, email, password });
    // Auto-login right after registering
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("cc_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
