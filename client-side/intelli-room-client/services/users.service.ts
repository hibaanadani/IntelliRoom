import api from "./axiosInstance";
import { User } from "../app/context/AuthContext";

export const isAxiosError = (error: any): boolean => {
  return error && typeof error === "object" && error.isAxiosError === true;
};

export const getUsers = (token: string) => {
  return api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProfile = async (
  userId: string,
  data: any,
  token: string
): Promise<User> => {
  try {
    const response = await api.patch(`/users/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as User;
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred during profile update.");
    }
  }
};
