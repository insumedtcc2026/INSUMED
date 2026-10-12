
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

type TipoUsuario = "ADMIN" | "AUTORIZADOR" | "PACIENTE";

const chavesToken: Record<TipoUsuario, string> = {
  ADMIN: "token_admin",
  AUTORIZADOR: "token_autorizador",
  PACIENTE: "token_paciente",
};

export function useValidarToken(tipo: TipoUsuario) {
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    const validarToken = async () => {
      setVerificando(true);

      const token = localStorage.getItem(chavesToken[tipo]);

      if (!token) {
        if (!cancelado) {
          setVerificando(false);
          navigate("/login");
        }
        return;
      }

      try {
        const response = await axios.get(
          "https://backend-insumed-lhac.vercel.app/validar",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
const tipoRecebido = (
  response.data?.session?.tipo ??
  response.data?.tipo ??
  response.data?.usuario?.tipo
)?.toString().toUpperCase();

console.log("TIPO ESPERADO:", tipo);
console.log("RESPOSTA DA VALIDAÇÃO:", response.data);
console.log("TIPO RECEBIDO:", tipoRecebido);

if (tipoRecebido !== tipo) {
  throw new Error(
    `Perfil incorreto. Esperado: ${tipo}; recebido: ${tipoRecebido ?? "não informado"}`
  );
}
        if (!cancelado) {
          setVerificando(false);
        }
      } catch (error) {
        console.error("Erro ao validar o token:", error);

        if (!cancelado) {
          localStorage.removeItem(chavesToken[tipo]);
          setVerificando(false);

          await Swal.fire({
            icon: "error",
            title: "Sessão inválida",
            text: "Entre novamente com a conta correta.",
            confirmButtonColor: "#d33",
          });

          if (!cancelado) {
            navigate("/login");
          }
        }
      }
    };

    validarToken();

    return () => {
      cancelado = true;
    };
  }, [tipo, navigate]);

  return { verificando };
}
