import {useState, useEffect} from 'react';
import { prescricaopaciente } from '../services/PrescricaoService';

export interface SolicitacaoPaciente {
    sol_id: number;
    sol_data_solicitacao: string;
    sol_status: string;
    sol_observacao: string | null;
    pos_id: number;
    sol_prescricao: string | null;
}
export function usePrescricao(){
  const [prescricoes, setPrescricoes] = useState<SolicitacaoPaciente[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let certeza = true;

        async function carregardados() {
            try {
                setCarregando(true);
                setErro(null);
                const dados = await prescricaopaciente();
                if (certeza){
                    setPrescricoes(dados);
                }
            }catch (error: any) {
                if(certeza){
                    setErro("Erro ao carregar prescrições.");
                    console.error("Erro ao carregar prescrições:", error);
                }
            } finally{
                if (certeza) {
                    setCarregando(false);
                }
            }
        }
        carregardados()
        return () => {
            certeza = false;
        }
    }, []);
    return { prescricoes, carregando, erro };
}