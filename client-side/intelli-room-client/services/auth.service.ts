import api from "./axiosInstance.ts";

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullname: string;
  };
}

export const login = (email: string, password: string) => {
  return api.post<AuthResponse>("/login", { email, password });
};

export const signUp = (userData: any) => {
  return api.post<AuthResponse>("/users", userData);
};
