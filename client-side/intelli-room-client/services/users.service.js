import api from "axiosInstance";

export const getUsers = (token) => {
  return api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
