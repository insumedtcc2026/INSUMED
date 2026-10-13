
import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-insumed-lhac.vercel.app",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token_admin");

  if (
    token &&
    token !== "null" &&
    token !== "undefined" &&
    token.trim() !== ""
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  console.log(
    "Token administrativo válido:",
    Boolean(token && token !== "null" && token !== "undefined" && token.trim() !== "")
  );

  return config;
});

export default api;
