import api from "./axiosInstance.ts";

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
    throw error;
  }
};
