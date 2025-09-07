import api from "./axiosInstance.ts";

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
) => {
  try {
    const response = await api.put(`/users/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
