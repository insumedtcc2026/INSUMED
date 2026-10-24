import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { mensagemErroApi } from "../utils/validacoes";

export type PerfilEquipe = "ADMIN" | "AUTORIZADOR";

export interface InfoConvite {
  perfil: PerfilEquipe;
  posto: { pos_id: number; pos_nome: string } | null;
  expira_em: string;
}

/**
 * Convite do link de cadastro da equipe (?convite=...).
 * O cadastro de administrador e de autorizador só funciona com um convite
 * válido gerado pelo administrador universal na página "Equipe".
 */
export function useConvite(perfil: PerfilEquipe) {
  const [params] = useSearchParams();
  const codigo = params.get("convite") ?? "";
  const [info, setInfo] = useState<InfoConvite | null>(null);
  const [erroConsulta, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(Boolean(codigo));
  const erro = codigo
    ? erroConsulta
    : "O cadastro da equipe é feito só por convite. Peça o link de cadastro à administração da rede de saúde.";

  useEffect(() => {
    if (!codigo) return;
    let cancelado = false;
    axios
      .get<InfoConvite>(`${API_URL}/convites/info`, { params: { codigo } })
      .then(({ data }) => {
        if (cancelado) return;
        if (data.perfil !== perfil) {
          setErro(`Este convite é para cadastro de ${data.perfil === "ADMIN" ? "administrador" : "autorizador"}. Use o link exatamente como recebeu.`);
        } else {
          setInfo(data);
          setErro(null);
        }
      })
      .catch((e) => {
        if (!cancelado) setErro(mensagemErroApi(e, "Não foi possível conferir o convite. Tente novamente."));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [codigo, perfil]);

  return { codigo, info, erro, carregando: Boolean(codigo) && carregando };
}
