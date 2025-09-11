import api from "./axiosInstance";

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
  userId: number,
  data: any,
  token: string
) => {
  try {
    const response = await api.patch(`/users/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred during profile update.");
    }
  }
};
