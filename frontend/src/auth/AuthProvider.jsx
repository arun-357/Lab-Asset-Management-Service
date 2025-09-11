import React, { createContext, useEffect, useState } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ username: payload.sub, roles: payload.scopes || [] });
    } catch (err) {
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    const data = new URLSearchParams();
    data.append("username", username);
    data.append("password", password);
    const res = await axios.post("/auth/token", data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const token = res.data.access_token;
    localStorage.setItem("access_token", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser({ username: payload.sub, roles: payload.scopes || [] });
  }

  async function register(payload) {
    return axios.post("/auth/register", payload);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
