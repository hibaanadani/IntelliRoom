import api from "./axiosInstance.ts";

export const getUsers = (token: string) => {
  return api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
