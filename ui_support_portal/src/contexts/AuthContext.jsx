import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

function getInitialAuth() {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const savedToken = localStorage.getItem("bookleaf_token");
    const savedUser = localStorage.getItem("bookleaf_user");
    if (savedToken && savedUser) {
      return { token: savedToken, user: JSON.parse(savedUser) };
    }
  } catch {
    localStorage.removeItem("bookleaf_token");
    localStorage.removeItem("bookleaf_user");
  }
  return { token: null, user: null };
}

const initialAuth = getInitialAuth();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialAuth.user);
  const [token, setToken] = useState(initialAuth.token);

  const loginUser = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("bookleaf_token", newToken);
    localStorage.setItem("bookleaf_user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("bookleaf_token");
    localStorage.removeItem("bookleaf_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
