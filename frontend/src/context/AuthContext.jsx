/**
 * Authentication context — manages user state and JWT tokens.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { authApi, getStoredTokens, setStoredTokens, clearStoredTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify stored tokens on mount
  useEffect(() => {
    const tokens = getStoredTokens();
    if (tokens?.access) {
      authApi
        .profile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("auth_user", JSON.stringify(res.data));
        })
        .catch(() => {
          clearStoredTokens();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const { user: newUser, access, refresh } = res.data;
    setStoredTokens({ access, refresh });
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setUser(newUser);
    toast.success(`Welcome, ${newUser.username}!`);
    return newUser;
  }, []);

  const login = useCallback(async (data) => {
    // data = { email, password } — email is the USERNAME_FIELD on the backend
    const res = await authApi.login(data);
    const { access, refresh } = res.data;
    setStoredTokens({ access, refresh });
    // Fetch profile to populate user info
    const profileRes = await authApi.profile();
    const profile = profileRes.data;
    localStorage.setItem("auth_user", JSON.stringify(profile));
    setUser(profile);
    toast.success(`Welcome back, ${profile.username}!`);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens?.refresh) {
        await authApi.logout(tokens.refresh);
      }
    } catch {
      // Best-effort: still clear local state
    } finally {
      clearStoredTokens();
      setUser(null);
      toast.success("Logged out successfully.");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
