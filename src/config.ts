// Endereço do backend usado por todo o frontend.
// Sem configuração, usa o backend de produção (comportamento de sempre).
// Para testar com outro backend (local ou uma prévia da Vercel com banco de
// teste), defina VITE_API_URL num arquivo .env.local ou nas variáveis de
// ambiente da Vercel, por exemplo:  VITE_API_URL=http://localhost:3344
export const API_URL = (
  import.meta.env.VITE_API_URL || "https://backend-insumed-lhac.vercel.app"
).replace(/\/+$/, "");
