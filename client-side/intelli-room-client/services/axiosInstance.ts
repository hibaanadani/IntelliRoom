import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

console.log("API Base URL:", process.env.EXPO_PUBLIC_API_URL);

export default api;
