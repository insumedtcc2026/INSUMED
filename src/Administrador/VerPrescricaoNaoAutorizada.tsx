import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";


import Header from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";

import "../css/home/AutorizarPrescicoesAut.css";
import { exibirCPF } from "../utils/validacoes";
import { API_URL } from "../config";


interface Solicitacao {
    sol_id: number;
    pac_id: number;
    pos_id: number;
    ins_id: number | null;
    sol_insumo_quant: number;
    sol_status: string;
    sol_data_solicitacao: string;
    sol_data_vencimento?: string | null;
    sol_observacao?: string | null;
    sol_prescricao_tipo?: string | null;
    sol_motivo_nao_autorizado?: string | null;
    pac_nome: string;
    pac_cpf: string;
    pos_nome?: string | null;
    ins_nome?: string | null;
}

function formatarData(data?: string | null) {
    if (!data) return "Não informada";

    return new Date(data).toLocaleDateString("pt-BR");
}

export default function VerPrescricaoNaoAutorizada() {
    const { id } = useParams();
    

    const [solicitacao, setSolicitacao] =
        useState<Solicitacao | null>(null);

    const [imagem, setImagem] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
    if (!id) {
        setErro("Identificador da solicitação não informado.");
        setCarregando(false);
        return;
    }

    

    let imagemUrl: string | null = null;
    let cancelado = false;

    async function carregarDados() {
        setCarregando(true);
        setErro("");

        const token =
            localStorage.getItem("token") ??
            sessionStorage.getItem("token_admin") ??
            sessionStorage.getItem("token");

        if (!token) {
            setErro("Sessão administrativa não encontrada. Faça login novamente.");
            setCarregando(false);
            return;
        }

        try {
            // 1. Carrega os dados da solicitação
            const resposta = await axios.get<Solicitacao>(
                `${API_URL}/solicitacao/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (cancelado) return;

            setSolicitacao(resposta.data);

            // 2. Carrega a imagem separadamente
            try {
                const respostaImagem = await axios.get(
                    `${API_URL}/solicitacao/${id}/prescricao`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        responseType: "blob",
                    }
                );

                if (cancelado) return;

                imagemUrl = URL.createObjectURL(respostaImagem.data);
                setImagem(imagemUrl);
            } catch (erroImagem) {
                console.error("Erro ao carregar a imagem:", erroImagem);

                if (!cancelado) {
                    setImagem(null);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar os dados da solicitação:", error);

            if (axios.isAxiosError(error)) {
                console.error("Detalhes do erro:", {
                    url: error.config?.url,
                    status: error.response?.status,
                    resposta: error.response?.data,
                    mensagem: error.message,
                });
            }

            if (!cancelado) {
                setErro(
                    "Não foi possível carregar os dados da prescrição. Verifique o erro no console."
                );
            }
        } finally {
            if (!cancelado) {
                setCarregando(false);
            }
        }
    }

    carregarDados();

    return () => {
        cancelado = true;

        if (imagemUrl) {
            URL.revokeObjectURL(imagemUrl);
        }
    };
}, [id]);

const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
};
    return (
        
        <div className="enviar-prescricao-page">
            <Header onMenuClick={toggleSidebar} />

            <Sidebaradm
                isOpen={sidebarOpen}
                onClose={toggleSidebar}
            />

            <main className="enviar-prescricao-content">
                <div className="barra-voltar barra-voltar--interna">
                    <BotaoVoltar para="/versolicitaçoes" />
                </div>

                <h1>Detalhes da prescrição</h1>

                {carregando && <p>Carregando prescrição...</p>}

                {!carregando && erro && (
                    <p role="alert">{erro}</p>
                )}

                {!carregando && solicitacao && (
                    <>
                        <div className="prescricao-container">
                            <section className="prescricao-preview">
                                <h2>Imagem da prescrição</h2>

                                <div className="prescricao-imagem">
                                    {imagem ? (
                                        <img
                                            src={imagem}
                                            alt="Prescrição médica do paciente"
                                        />
                                    ) : (
                                        <p>Imagem indisponível.</p>
                                    )}
                                </div>
                            </section>

                            <section className="informacoes-prescricao">
                                <h2>Informações da prescrição</h2>

                                <div className="campo">
                                    <label>Nome do paciente</label>
                                    <input
                                        value={solicitacao.pac_nome || ""}
                                        readOnly
                                    />
                                </div>

                                <div className="linha-campos">
                                    <div className="campo">
                                        <label>CPF</label>
                                        <input
                                            value={solicitacao.pac_cpf ? exibirCPF(solicitacao.pac_cpf) : ""}
                                            readOnly
                                        />
                                    </div>

                                    <div className="campo">
                                        <label>Código</label>
                                        <input
                                            value={solicitacao.sol_id}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="linha-campos">
                                    <div className="campo">
                                        <label>Data de envio</label>
                                        <input
                                            value={formatarData(
                                                solicitacao.sol_data_solicitacao
                                            )}
                                            readOnly
                                        />
                                    </div>

                                    <div className="campo">
                                        <label>Data de vencimento</label>
                                        <input
                                            value={formatarData(
                                                solicitacao.sol_data_vencimento
                                            )}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="campo">
                                    <label>Unidade de saúde</label>
                                    <input
                                        value={solicitacao.pos_nome || ""}
                                        readOnly
                                    />
                                </div>

                                <div className="linha-insumo">
                                    <div className="ins-campo">
                                        <label className="ins-label">
                                            Insumo
                                        </label>
                                        <input
                                            className="ins-input"
                                            value={solicitacao.ins_nome || ""}
                                            readOnly
                                        />
                                    </div>

                                    <div className="ins-campo">
                                        <label className="ins-label">
                                            Quantidade
                                        </label>
                                        <input
                                            className="ins-input"
                                            value={
                                                solicitacao.sol_insumo_quant ?? 0
                                            }
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="campo">
                                    <label>Observações</label>
                                    <textarea
                                        value={
                                            solicitacao.sol_observacao ||
                                            "Nenhuma observação informada."
                                        }
                                        readOnly
                                    />
                                </div>

                                <div className="campo">
                                    <label>Status</label>
                                    <input
                                        value={
                                            solicitacao.sol_status ===
                                            "Nao Autorizado"
                                                ? "Não Autorizado"
                                                : solicitacao.sol_status
                                        }
                                        readOnly
                                    />
                                </div>

                               {solicitacao?.sol_status === "Nao Autorizado" && (
    <div className="campo motivo-nao-autorizado">
        <label>Motivo da não autorização</label>
        <textarea
            value={solicitacao.sol_motivo_nao_autorizado ?? ""}
            placeholder="O motivo não foi retornado pela API."
            readOnly
            rows={4}
        />
    </div>

)}
                            </section>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
        
    );
}
