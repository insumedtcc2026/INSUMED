
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../config";

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
          `${API_URL}/validar`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // a resposta traz os dados da sessão: não vai para o console
        const tipoRecebido = (
          response.data?.session?.tipo ??
          response.data?.tipo ??
          response.data?.usuario?.tipo
        )?.toString().toUpperCase();

        if (tipoRecebido !== tipo) {
          throw new Error(
            `Perfil incorreto. Esperado: ${tipo}; recebido: ${tipoRecebido ?? "não informado"}`
          );
        }
        if (!cancelado) {
          setVerificando(false);
        }
      } catch (error) {
        // só a mensagem: o objeto do erro do axios carrega o token no cabeçalho
        console.error("Erro ao validar o token:", error instanceof Error ? error.message : error);

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
