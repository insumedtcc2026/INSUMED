import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-insumed-lhac.vercel.app",
});

api.interceptors.request.use((config) => {
  const tokenAdmin = localStorage.getItem("token_admin");
  const tokenPaciente = localStorage.getItem("token_paciente");
  const tokenAutorizador = localStorage.getItem("token_autorizador");

  const tokenValido = (token: string | null) =>
    token && token !== "null" && token !== "undefined" && token.trim() !== ""
      ? token
      : null;

  const token =
    tokenValido(tokenAdmin) ||
    tokenValido(tokenPaciente) ||
    tokenValido(tokenAutorizador);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  console.log("TOKEN ENVIADO:", token ? "Token encontrado" : "Nenhum token válido");

  return config;
});

export default api;