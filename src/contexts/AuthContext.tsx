import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, parseJwt, setAuthToken, clearAuthToken } from "@/lib/api";

interface AuthUser {
  userId?: number;
  email?: string;
  role?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("milk_mate_token");
    if (!token) return null;

    const decoded = parseJwt(token);
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      clearAuthToken();
      return null;
    }

    return decoded;
  });

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setAuthToken(response.token);
    const decoded = parseJwt(response.token);
    if (decoded) {
      setUser(decoded);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
