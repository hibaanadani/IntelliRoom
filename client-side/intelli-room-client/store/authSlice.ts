import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  login as loginService,
  signUp as signUpService,
} from "../services/auth.service";

const parseNumberInt = (data: any) => {
  if (data && typeof data === "object" && data["$numberInt"]) {
    return Number(data["$numberInt"]);
  }
  return data;
};

const formatUserData = (userData: ApiUserResponse): User => {
  return {
    id: userData._id || String(userData.id || ""),
    _id: userData._id || String(userData.id || ""),
    email: userData.email,
    fullname: userData.fullname,
    age: userData.age ? parseNumberInt(userData.age) : null,
    phone: userData.phone || null,
  };
};

interface SignUpData {
  fullname: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  _id: string;
  email: string;
  fullname: string;
  age: number | null;
  phone: string | null;
}

interface ApiUserResponse {
  id?: number | string;
  _id?: string;
  email: string;
  fullname: string;
  age?: number | { $numberInt: string };
  phone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  error: null,
};

export const loadAuthData = createAsyncThunk(
  "auth/loadAuthData",
  async (_, { rejectWithValue }) => {
    try {
      const storedToken = await AsyncStorage.getItem("access_token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const formattedUser = formatUserData(parsedUser);
        return { token: storedToken, user: formattedUser };
      }
      return null;
    } catch (error) {
      return rejectWithValue("Failed to load auth data");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await loginService(email, password);
      const accessToken = response.data.access_token;
      const userData: ApiUserResponse = response.data.user;

      const formattedUser = formatUserData(userData);

      await AsyncStorage.setItem("access_token", accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(formattedUser));

      return { token: accessToken, user: formattedUser };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (userData: SignUpData, { rejectWithValue }) => {
    try {
      const response = await signUpService(userData);
      const accessToken = response.data.access_token;
      const userResponseData: ApiUserResponse = response.data.user;

      const formattedUser = formatUserData(userResponseData);

      await AsyncStorage.setItem("access_token", accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(formattedUser));

      return { token: accessToken, user: formattedUser };
    } catch (error: any) {
      return rejectWithValue(error.message || "Sign up failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("access_token");
  await AsyncStorage.removeItem("user");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAuthData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadAuthData.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(loadAuthData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
