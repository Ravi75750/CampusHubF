import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 && error.response?.data?.message === "USER_BANNED") {
      localStorage.removeItem("cc_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
