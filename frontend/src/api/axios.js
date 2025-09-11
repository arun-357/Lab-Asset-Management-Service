import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const instance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("access_token");
    }
    return Promise.reject(err);
  }
);

export default instance;
