import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface AuthContextValue {
  employeeId: string | null;
  isAuthenticated: boolean;
  login: (id: string, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employeeId, setEmployeeId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("employeeId");
    } catch {
      return null;
    }
  });

  // persistence happens only when `login(..., remember=true)` is used

  const login = (id: string, remember = false) => {
    const trimmed = id.trim() || null;
    setEmployeeId(trimmed);
    try {
      if (remember && trimmed) localStorage.setItem("employeeId", trimmed);
      else localStorage.removeItem("employeeId");
    } catch {
      /* ignore storage errors */
    }
  };

  const logout = () => {
    setEmployeeId(null);
    try {
      localStorage.removeItem("employeeId");
    } catch {}
  };

  const value = useMemo(
    () => ({
      employeeId,
      isAuthenticated: !!employeeId,
      login,
      logout,
    }),
    [employeeId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
