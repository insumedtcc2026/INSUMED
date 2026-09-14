import { useState, useEffect } from 'react';
import { prescricaopaciente, type SolicitacaoPaciente } from '../services/PrescricaoService';

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