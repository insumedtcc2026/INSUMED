
import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-insumed-lhac.vercel.app",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token_paciente");

  

  if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
