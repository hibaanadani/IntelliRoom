import { createContext, useState, useContext, useEffect } from "react";
import { login, signUp } from "../../services/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  email: string;
  fullname: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (userData: Omit<User, "id">) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthSuccess = async (accessToken: string, userData: User) => {
    setToken(accessToken);
    setUser(userData);
    await AsyncStorage.setItem("access_token", accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("access_token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as User);
        }
      } catch (error) {
        console.error("Failed to load auth data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      await handleAuthSuccess(response.data.access_token, response.data.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const handleSignUp = async (userData: Omit<User, "id">) => {
    try {
      const response = await signUp(userData);
      await handleAuthSuccess(response.data.access_token, response.data.user);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("user");
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
