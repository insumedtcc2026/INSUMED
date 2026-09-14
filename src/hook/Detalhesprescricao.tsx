import { useState } from 'react';
import { buscarDetalhesPrescricao, type DetalhesPrescricao } from '../services/PrescricaoService';

export function useDetalhesPrescricao() {
    const [detalhes, setDetalhes] = useState<DetalhesPrescricao | null>(null);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
    const [erroDetalhes, setErroDetalhes] = useState<string | null>(null);

    async function abrirDetalhes(sol_id: number) {
        try {
            setCarregandoDetalhes(true);
            setErroDetalhes(null);
            const dados = await buscarDetalhesPrescricao(sol_id);
            setDetalhes(dados);
        } catch (error) {
            setErroDetalhes("Não foi possível carregar os informações da prescrição.");
            console.error("Erro ao buscar detalhes:", error);
        } finally {
            setCarregandoDetalhes(false);
        }
    }

    function fecharDetalhes() {
        setDetalhes(null);
        setErroDetalhes(null);
    }

    return {
        detalhes,
        carregandoDetalhes,
        erroDetalhes,
        abrirDetalhes,
        fecharDetalhes
    };
}