import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const storedUser = localStorage.getItem("chatAppUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("chatAppUser");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("chatAppToken"));
  const [authLoading, setAuthLoading] = useState(false);

  const persistSession = (authUser, authToken) => {
    localStorage.setItem("chatAppUser", JSON.stringify(authUser));
    localStorage.setItem("chatAppToken", authToken);
    setUser(authUser);
    setToken(authToken);
  };

  const logout = useCallback(
    (showMessage = true) => {
      localStorage.removeItem("chatAppUser");
      localStorage.removeItem("chatAppToken");
      setUser(null);
      setToken(null);

      if (showMessage) {
        showToast("Logged out successfully", "success");
      }

      navigate("/login", { replace: true });
    },
    [navigate, showToast],
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      logout(false);
      showToast("Session expired. Please log in again.", "error");
    };

    window.addEventListener("auth:logout", handleUnauthorized);
    return () => window.removeEventListener("auth:logout", handleUnauthorized);
  }, [logout, showToast]);

  const login = async (credentials) => {
    setAuthLoading(true);

    try {
      const { data } = await api.post("/auth/login", credentials);
      persistSession(data.user, data.token);
      showToast("Login successful", "success");
      navigate("/", { replace: true });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      showToast(message, "error");
      return { success: false, message };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);

    try {
      const { data } = await api.post("/auth/register", payload);
      persistSession(data.user, data.token);
      showToast("Registration successful", "success");
      navigate("/", { replace: true });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      showToast(message, "error");
      return { success: false, message };
    } finally {
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, authLoading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
