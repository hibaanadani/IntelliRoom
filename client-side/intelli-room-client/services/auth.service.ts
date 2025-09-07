import api from "./axiosInstance.ts";

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    fullname: string;
  };
}

export const login = (email: string, password: string) => {
  return api.post<AuthResponse>("/login", { email, password });
};

export const signUp = (userData: any) => {
  return api.post<AuthResponse>("/auth/signup", userData);
};
