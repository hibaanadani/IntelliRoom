import api from "axiosInstance";

export const login = (email, password) => {
  return api.post("/login", { email, password });
};

export const signUp = (userData) => {
  return api.post("/users", userData);
};
