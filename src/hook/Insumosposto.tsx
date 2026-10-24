import { useState,useEffect } from "react";
import { API_URL } from "../config";
import { pedirAtualizacaoNotificacoes } from "../utils/notificacoes";

export interface Insumos {
    ins_id: number;
  ins_nome: string;
  ins_marca?: string;
  ins_quantidade: number;
  // reservado = já prometido em coletas agendadas; disponível = o que sobra
  ins_reservado?: number;
  ins_disponivel?: number;
  pos_id?: number | null;
  posto_nome: string | null;
}

export function useDadosInsumos() {
    const [insumos, setInsumos] = useState<Insumos[] | null>(null); 

    async function carregarInsumos(){
        try{
            const token = localStorage.getItem("token_admin");
            const resposta = await fetch(`${API_URL}/insumos/listar`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!resposta.ok) {
                throw new Error("Erro ao buscar insumos");
            }
            const data = await resposta.json();
           setInsumos(data);
            
        }catch(error){
            console.error("Erro ao carregar insumos:", error);
            setInsumos([]);
        }
    }

    async function movimentarInsumo(id: number, tipo: "entrada" | "saida", quantidade: number) {
  const token = localStorage.getItem("token_admin");

  const resposta = await fetch(`${API_URL}/insumos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tipo, quantidade }),
  });

  const data = await resposta.json();

  if (!resposta.ok) {
    throw new Error(data.message);
  }

  pedirAtualizacaoNotificacoes(); // aviso de estoque baixo/esgotado no sino
  await carregarInsumos();
  return data;
}
    
        useEffect(() => {
            carregarInsumos();
        }, []);

        return { insumos, carregarInsumos, movimentarInsumo };
    }