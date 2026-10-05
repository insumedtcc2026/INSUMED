import { useState,useEffect } from "react";

export interface Insumos {
    ins_id: number;
  ins_nome: string;
  ins_marca?: string;
  ins_quantidade: number;
  posto_nome: string | null;
}

export function useDadosInsumos() {
    const [insumos, setInsumos] = useState<Insumos[] | null>(null); 

    async function carregarInsumos(){
        try{
            const token = localStorage.getItem("token");
            const resposta = await fetch("https://backend-insumed-lhac.vercel.app/insumos/listar", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!resposta.ok) {
                throw new Error("Erro ao buscar insumos");
            }
            const data = await resposta.json();
           setInsumos(data);
            
            console.log(data);
            
        }catch(error){
            console.error("Erro ao carregar insumos:", error);
            setInsumos([]);
        }
    }

    async function movimentarInsumo(id: number, tipo: "entrada" | "saida", quantidade: number) {
  const token = localStorage.getItem("token");

  const resposta = await fetch(`https://backend-insumed-lhac.vercel.app/insumos/${id}`, {
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

  await carregarInsumos();
  return data;
}
    
        useEffect(() => {
            carregarInsumos();
        }, []);

        return { insumos, carregarInsumos, movimentarInsumo };
    }