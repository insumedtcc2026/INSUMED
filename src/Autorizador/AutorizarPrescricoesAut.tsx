import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { useValidarToken } from "../hook/Validartoken.tsx";

import Sidebaradm from "../components/universais/Siderbaradm.tsx";
import Header from "../components/universais/HeaderAut.tsx";
import Footer from "../components/universais/Footer.tsx";

import "../css/home/AutorizarPrescricao.css";


const API_URL = "https://backend-insumed-lhac.vercel.app";


interface SolicitacaoAprovada {
    sol_id: number;
    pac_id: number;
    pos_id: number;
    ins_id: number;

    sol_status: string;

    sol_data_solicitacao: string;
    sol_data_vencimento?: string | null;

    sol_observacao?: string | null;
    sol_prescricao_tipo?: string | null;

    sol_insumo_quant: number;

    pac_nome: string;
    pac_cpf: string;
    pac_avatar?: string | null;

    pos_nome?: string | null;

    ins_nome?: string | null;
    ins_marca?: string | null;
}


export default function AutorizarPrescricaoAutorizador() {

    const { id } = useParams();

    const navigate = useNavigate();

    const { verificando } = useValidarToken();


    // =====================================================
    // ESTADOS
    // =====================================================

    const [solicitacao, setSolicitacao] =
        useState<SolicitacaoAprovada | null>(null);

    const [imagemPrescricao, setImagemPrescricao] =
        useState<string | null>(null);

    const [carregando, setCarregando] =
        useState(true);

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [processando, setProcessando] =
        useState(false);


    // =====================================================
    // SIDEBAR
    // =====================================================

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };


    // =====================================================
    // BUSCAR DADOS
    // =====================================================

    useEffect(() => {

        if (!id) {
            return;
        }

        const carregarDados = async () => {

            try {

                setCarregando(true);

                const token =
                    localStorage.getItem("token");


                // =========================================
                // BUSCAR INFORMAÇÕES DA SOLICITAÇÃO
                // =========================================

                const response =
                    await axios.get<SolicitacaoAprovada>(
                        `${API_URL}/autorizador/solicitacao/${id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                console.log(
                    "Solicitação aprovada:",
                    response.data
                );


                setSolicitacao(
                    response.data
                );


                // =========================================
                // BUSCAR IMAGEM DA PRESCRIÇÃO
                // =========================================

                const imagemResponse =
                    await axios.get(
                        `${API_URL}/autorizador/solicitacao/${id}/prescricao`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            },

                            responseType: "blob"
                        }
                    );


                const imagemUrl =
                    URL.createObjectURL(
                        imagemResponse.data
                    );


                setImagemPrescricao(
                    imagemUrl
                );


            } catch (error) {

                console.error(
                    "Erro ao buscar prescrição:",
                    error
                );

                alert(
                    "Não foi possível carregar a prescrição."
                );

                navigate(
                    "/verprescricoesaprovadas"
                );

            } finally {

                setCarregando(false);

            }

        };


        carregarDados();


        return () => {

            if (imagemPrescricao) {
                URL.revokeObjectURL(
                    imagemPrescricao
                );
            }

        };

    }, [id]);


    // =====================================================
    // ALTERAR STATUS
    // =====================================================

    const alterarStatus =
        async (
            status: "Autorizado" | "Nao Autorizado"
        ) => {

            if (!id) {
                return;
            }


            try {

                setProcessando(true);

                const token =
                    localStorage.getItem("token");


                await axios.patch(
                    `${API_URL}/autorizador/solicitacao/${id}`,
                    {
                        sol_status: status
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


                alert(
                    status === "Autorizado"
                        ? "Prescrição autorizada com sucesso!"
                        : "Prescrição não autorizada."
                );


                navigate(
                    "/verprescricoesaprovadas"
                );


            } catch (error) {

                console.error(
                    "Erro ao alterar status:",
                    error
                );

                if (
                    axios.isAxiosError(error) &&
                    error.response?.data?.error
                ) {

                    alert(
                        error.response.data.error
                    );

                } else {

                    alert(
                        "Erro ao alterar o status da prescrição."
                    );

                }

            } finally {

                setProcessando(false);

            }

        };


    // =====================================================
    // CARREGANDO TOKEN
    // =====================================================

    if (verificando) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <p>
                    Carregando seus dados...
                </p>

            </div>
        );

    }


    // =====================================================
    // CARREGANDO DADOS
    // =====================================================

    if (carregando) {

        return (
            <>
                <Header
                    onMenuClick={toggleSidebar}
                />

                <Sidebaradm
                    isOpen={sidebarOpen}
                    onClose={toggleSidebar}
                />

                <main className="autorizar-page">

                    <div className="autorizar-carregando">

                        <p>
                            Carregando prescrição...
                        </p>

                    </div>

                </main>

                <Footer />
            </>
        );

    }


    // =====================================================
    // CASO NÃO ENCONTRE
    // =====================================================

    if (!solicitacao) {

        return (
            <>
                <Header
                    onMenuClick={toggleSidebar}
                />

                <Sidebaradm
                    isOpen={sidebarOpen}
                    onClose={toggleSidebar}
                />

                <main className="autorizar-page">

                    <div className="autorizar-erro">

                        <h2>
                            Prescrição não encontrada
                        </h2>

                        <button
                            onClick={() =>
                                navigate(
                                    "/verprescricoesaprovadas"
                                )
                            }
                        >
                            VOLTAR
                        </button>

                    </div>

                </main>

                <Footer />
            </>
        );

    }


    // =====================================================
    // PÁGINA
    // =====================================================

    return (
        <>

            <Header
                onMenuClick={toggleSidebar}
            />

            <Sidebaradm
                isOpen={sidebarOpen}
                onClose={toggleSidebar}
            />


            <main className="autorizar-page">

                {/* =========================================
                    TÍTULO
                ========================================= */}

                <div className="autorizar-header">

                    <button
                        className="btn-voltar"
                        onClick={() =>
                            navigate(
                                "/verprescricoesaprovadas"
                            )
                        }
                    >
                        ← VOLTAR
                    </button>

                    <div>

                        <h1>
                            Autorizar Prescrição
                        </h1>

                        <p>
                            Analise a prescrição aprovada
                            pelo administrador.
                        </p>

                    </div>

                </div>


                {/* =========================================
                    CONTEÚDO
                ========================================= */}

                <div className="autorizar-container">


                    {/* =====================================
                        PRESCRIÇÃO
                    ===================================== */}

                    <section className="prescricao-visualizacao">

                        <h2>
                            Prescrição médica
                        </h2>

                        <div className="prescricao-imagem-autorizador">

                            {imagemPrescricao ? (

                                <img
                                    src={imagemPrescricao}
                                    alt="Prescrição médica"
                                />

                            ) : (

                                <p>
                                    Imagem da prescrição
                                    não encontrada.
                                </p>

                            )}

                        </div>

                    </section>


                    {/* =====================================
                        INFORMAÇÕES
                    ===================================== */}

                    <section className="informacoes-autorizador">

                        <h2>
                            Informações da solicitação
                        </h2>


                        {/* PACIENTE */}

                        <div className="informacao-grupo">

                            <h3>
                                Paciente
                            </h3>

                            <p>
                                <strong>
                                    Nome:
                                </strong>{" "}
                                {solicitacao.pac_nome}
                            </p>

                            <p>
                                <strong>
                                    CPF:
                                </strong>{" "}
                                {solicitacao.pac_cpf}
                            </p>

                        </div>


                        {/* SOLICITAÇÃO */}

                        <div className="informacao-grupo">

                            <h3>
                                Solicitação
                            </h3>

                            <p>
                                <strong>
                                    Código:
                                </strong>{" "}
                                {solicitacao.sol_id}
                            </p>

                            <p>
                                <strong>
                                    Data:
                                </strong>{" "}

                                {new Date(
                                    solicitacao.sol_data_solicitacao
                                ).toLocaleDateString(
                                    "pt-BR"
                                )}

                            </p>

                            <p>
                                <strong>
                                    Posto:
                                </strong>{" "}

                                {solicitacao.pos_nome ||
                                    "Não informado"}

                            </p>

                        </div>


                        {/* INSUMO */}

                        <div className="informacao-grupo">

                            <h3>
                                Insumo
                            </h3>

                            <p>
                                <strong>
                                    Nome:
                                </strong>{" "}

                                {solicitacao.ins_nome ||
                                    "Não informado"}

                            </p>

                            {solicitacao.ins_marca && (

                                <p>
                                    <strong>
                                        Marca:
                                    </strong>{" "}

                                    {solicitacao.ins_marca}

                                </p>

                            )}

                            <p>
                                <strong>
                                    Quantidade:
                                </strong>{" "}

                                {solicitacao.sol_insumo_quant}

                            </p>

                        </div>


                        {/* OBSERVAÇÃO */}

                        <div className="informacao-grupo">

                            <h3>
                                Observação
                            </h3>

                            <p className="observacao-autorizador">

                                {solicitacao.sol_observacao ||
                                    "Nenhuma observação informada."}

                            </p>

                        </div>


                        {/* STATUS */}

                        <div className="status-atual">

                            <strong>
                                Status atual:
                            </strong>

                            <span>
                                {solicitacao.sol_status}
                            </span>

                        </div>

                    </section>

                </div>


                {/* =========================================
                    AÇÕES
                ========================================= */}

                <div className="acoes-autorizador">

                    <button
                        className="btn-nao-autorizar"
                        disabled={processando}
                        onClick={() =>
                            alterarStatus(
                                "Nao Autorizado"
                            )
                        }
                    >
                        NÃO AUTORIZAR
                    </button>


                    <button
                        className="btn-autorizar"
                        disabled={processando}
                        onClick={() =>
                            alterarStatus(
                                "Autorizado"
                            )
                        }
                    >
                        AUTORIZAR
                    </button>

                </div>

            </main>


            <Footer />

        </>
    );
}