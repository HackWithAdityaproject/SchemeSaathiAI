import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  API_BASE_URL,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => active && setUser(currentUser))
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 401) {
          setUser(null);
          return;
        }
        setAuthError(`We couldn’t verify your session with ${API_BASE_URL || "the current site"}. Start Spring Boot, verify its port, then refresh.`);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    login: async (credentials) => {
      const currentUser = await loginUser(credentials);
      setUser(currentUser);
      setAuthError("");
      return currentUser;
    },
    register: async (account) => {
      const currentUser = await registerUser(account);
      setUser(currentUser);
      setAuthError("");
      return currentUser;
    },
    logout: async () => {
      await logoutUser();
      setUser(null);
    },
  }), [user, loading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
