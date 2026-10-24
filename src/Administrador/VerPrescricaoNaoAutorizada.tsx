import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { refazerComObservacao } from "../components/universais/acoesAdmin";


import Header from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";

import "../css/universais/RevisaoPrescricao.css";
import VisualizadorPrescricao, { SeloStatus } from "../components/universais/VisualizadorPrescricao";
import { exibirCPF } from "../utils/validacoes";
import { API_URL } from "../config";
import { useValidarToken } from "../hook/Validartoken";


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
    const { verificando } = useValidarToken("ADMIN");
    const { id } = useParams();
    const navigate = useNavigate();

    // a prescrição volta para o autorizador com a observação da unidade
    async function refazer() {
        if (!id) return;
        if (await refazerComObservacao(Number(id))) navigate("/versolicitaçoes");
    }
    

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

        // o login grava "token_admin" (as outras chaves são de versões antigas)
        const token =
            localStorage.getItem("token_admin") ??
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
                    "Não foi possível carregar os dados da prescrição. Tente novamente."
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
    // só o perfil de administrador abre esta tela
    if (verificando) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-lg text-gray-600">Carregando seus dados...</p>
            </div>
        );
    }

    return (
        <div className="rvp-pagina">
            <Header onMenuClick={toggleSidebar} />

            <Sidebaradm
                isOpen={sidebarOpen}
                onClose={toggleSidebar}
            />

            <main className="rvp-main">
                <div className="barra-voltar barra-voltar--interna">
                    <BotaoVoltar para="/versolicitaçoes" />
                </div>

                <header className="rvp-cabecalho">
                    <div>
                        <p className="rvp-sobretitulo">Detalhes da prescrição</p>
                        <h1 className="rvp-titulo">Prescrição nº {id}</h1>
                        {solicitacao?.pac_nome && (
                            <p className="rvp-subtitulo">
                                Paciente: <strong>{solicitacao.pac_nome}</strong>
                            </p>
                        )}
                    </div>
                    <SeloStatus status={solicitacao?.sol_status} />
                </header>

                {carregando && <p className="rvp-estado">Carregando prescrição...</p>}

                {!carregando && erro && (
                    <p className="rvp-estado rvp-estado--erro" role="alert">{erro}</p>
                )}

                {!carregando && solicitacao && (
                    <>
                        <div className="rvp-grade">
                            <VisualizadorPrescricao
                                url={imagem}
                                pdf={solicitacao.sol_prescricao_tipo === "application/pdf"}
                            />

                            <section className="rvp-card rvp-info" aria-labelledby="rvp-info-titulo">
                                <header className="rvp-card-topo">
                                    <h2 id="rvp-info-titulo" className="rvp-card-titulo">Informações da prescrição</h2>
                                </header>

                                <div className="rvp-grupo">
                                    <h3 className="rvp-grupo-titulo">Paciente</h3>
                                    <dl className="rvp-dados">
                                        <div className="rvp-dado rvp-dado--inteiro">
                                            <dt>Nome</dt>
                                            <dd>{solicitacao.pac_nome || "-"}</dd>
                                        </div>
                                        <div className="rvp-dado">
                                            <dt>CPF</dt>
                                            <dd>{solicitacao.pac_cpf ? exibirCPF(solicitacao.pac_cpf) : "-"}</dd>
                                        </div>
                                        <div className="rvp-dado">
                                            <dt>Código do pedido</dt>
                                            <dd>{solicitacao.sol_id}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="rvp-grupo">
                                    <h3 className="rvp-grupo-titulo">Prescrição</h3>
                                    <dl className="rvp-dados">
                                        <div className="rvp-dado">
                                            <dt>Enviada em</dt>
                                            <dd>{formatarData(solicitacao.sol_data_solicitacao)}</dd>
                                        </div>
                                        <div className="rvp-dado">
                                            <dt>Vencimento</dt>
                                            <dd className={solicitacao.sol_data_vencimento ? undefined : "rvp-vazio"}>
                                                {formatarData(solicitacao.sol_data_vencimento)}
                                            </dd>
                                        </div>
                                        <div className="rvp-dado rvp-dado--inteiro">
                                            <dt>Unidade de saúde</dt>
                                            <dd className={solicitacao.pos_nome ? undefined : "rvp-vazio"}>
                                                {solicitacao.pos_nome || "Não informada"}
                                            </dd>
                                        </div>
                                        <div className="rvp-dado">
                                            <dt>Insumo</dt>
                                            <dd className={solicitacao.ins_nome ? undefined : "rvp-vazio"}>
                                                {solicitacao.ins_nome || "Não informado"}
                                            </dd>
                                        </div>
                                        <div className="rvp-dado">
                                            <dt>Quantidade</dt>
                                            <dd>{solicitacao.sol_insumo_quant ?? 0}</dd>
                                        </div>
                                        <div className="rvp-dado rvp-dado--inteiro">
                                            <dt>Observações do paciente</dt>
                                            <dd className={solicitacao.sol_observacao ? undefined : "rvp-vazio"}>
                                                {solicitacao.sol_observacao ? (
                                                    <p className="rvp-texto-livre">{solicitacao.sol_observacao}</p>
                                                ) : (
                                                    "Nenhuma observação."
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </section>
                        </div>

                        {solicitacao.sol_status === "Nao Autorizado" && (
                            <div className="rvp-aviso rvp-aviso--erro" role="note">
                                <p className="rvp-aviso-titulo">Motivo da não autorização</p>
                                <p>{solicitacao.sol_motivo_nao_autorizado || "O motivo não foi registrado."}</p>
                            </div>
                        )}

                        {solicitacao.sol_status === "Nao Autorizado" && (
                            <div className="rvp-aviso" role="note">
                                <p className="rvp-aviso-titulo">Algo mudou?</p>
                                <p>
                                    Se há um documento novo ou uma correção, refaça o pedido com uma observação: a prescrição volta para o autorizador.
                                </p>
                                <button type="button" onClick={refazer} className="rvp-botao rvp-botao--primario">
                                    Refazer pedido
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
