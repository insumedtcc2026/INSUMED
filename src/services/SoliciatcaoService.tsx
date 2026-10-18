
import axios from "axios";
import { observarAcoes } from "../utils/notificacoes";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
});

// ações que mudam dados atualizam o sino na hora
observarAcoes(api);

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
