import { createContext, useState, useContext, useEffect } from "react";
import { login, signUp } from "../../services/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // A function to handle the JWT and user data
  const handleAuthSuccess = async (accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
    await AsyncStorage.setItem("token", accessToken);
    // You can also store user data if needed:
    // await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  // Check for a stored token when the app loads
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          // You might also need to fetch user data if you don't store it
          // const user = await fetchUser(storedToken);
          setToken(storedToken);
          // setUser(user);
        }
      } catch (error) {
        console.error("Failed to load auth data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await login(email, password);
      // Backend returns { access_token, user_data }
      await handleAuthSuccess(response.data.access_token, response.data.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Renamed from 'handleRegister' to 'handleSignUp'
  const handleSignUp = async (userData) => {
    try {
      const response = await signUp(userData);
      // Assuming a successful signup also returns a token and user data
      await handleAuthSuccess(response.data.access_token, response.data.user);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    // await AsyncStorage.removeItem('user');
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
