import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://campus-hub-b.vercel.app";

export const api = axios.create({
  baseURL: `${API_BASE}/api`
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("cc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
