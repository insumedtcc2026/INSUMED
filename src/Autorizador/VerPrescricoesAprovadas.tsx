import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    buscarPrescricoesAprovadas
} from "../services/PrescricaoService";

import type {
    PrescricaoAprovada
} from "../services/PrescricaoService";

import { useValidarToken } from "../hook/Validartoken.tsx";

import Sidebaradm from "../components/universais/Siderbaradm.tsx";
import Header from "../components/universais/HeaderAdm.tsx";
import Footer from "../components/universais/Footer.tsx";

import "../css/home/VerSolicitaçoes.css";


export default function Autorizador() {

    const navigate = useNavigate();


    // =========================
    // ESTADOS
    // =========================

    const [prescricoes, setPrescricoes] =
        useState<PrescricaoAprovada[]>([]);

    const [busca, setBusca] =
        useState("");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [, setCarregando] =
        useState(true);


    // =========================
    // VALIDAÇÃO DO TOKEN
    // =========================

    const { verificando } = useValidarToken();


    // =========================
    // SIDEBAR
    // =========================

    const toggleSidebar = () => {

        setSidebarOpen((prev) => !prev);

    };


    // =========================
    // BUSCAR PRESCRIÇÕES
    // =========================

    useEffect(() => {

        carregarPrescricoes();

    }, []);


    const carregarPrescricoes = async () => {

        try {

            setCarregando(true);

            const dados =
                await buscarPrescricoesAprovadas();

            console.log(
                "Prescrições aprovadas recebidas:",
                dados
            );

            setPrescricoes(dados);

        } catch (error) {

            console.error(
                "Erro ao carregar prescrições aprovadas:",
                error
            );

        } finally {

            setCarregando(false);

        }

    };


    // =========================
    // FILTRO
    // =========================

    const prescricoesFiltradas =
        prescricoes.filter((prescricao) => {

            const texto =
                busca.toLowerCase().trim();

            if (!texto) {
                return true;
            }

            return (
                prescricao.pac_nome
                    ?.toLowerCase()
                    .includes(texto) ||

                prescricao.pac_cpf
                    ?.toLowerCase()
                    .includes(texto) ||

                String(prescricao.sol_id)
                    .includes(texto)
            );

        });


    // =========================
    // CARREGANDO TOKEN
    // =========================

    if (verificando) {

        return (
            <div className="min-h-screen flex items-center justify-center">

                <p>
                    Carregando seus dados...
                </p>

            </div>
        );

    }


    return (

        <>

            <Header
                onMenuClick={toggleSidebar}
            />

            <Sidebaradm
                isOpen={sidebarOpen}
                onClose={toggleSidebar}
            />


            <div className="pagina-pendencias">

                <h1>
                    Prescrições aprovadas
                </h1>


                {/* =========================
                    PESQUISA
                ========================= */}

                <div className="barra-pesquisa">

                    <input
                        id="busca"
                        type="text"
                        value={busca}
                        onChange={(e) =>
                            setBusca(e.target.value)
                        }
                        placeholder="🔍 Digite o CPF ou código"
                    />

                </div>


                {/* =========================
                    LISTA
                ========================= */}

                <div className="lista-pendencias">

                    {prescricoesFiltradas.length === 0 && (

                        <div className="sem-pendencias">

                            <h2>
                                Nenhuma prescrição aprovada encontrada
                            </h2>

                        </div>

                    )}


                    {prescricoesFiltradas.map(
                        (prescricao) => (

                        <div
                            className="card-pendencia"
                            key={prescricao.sol_id}
                        >


                            {/* =========================
                                ÍCONE / AVATAR
                            ========================= */}

                            <div className="icone-paciente">

                                {prescricao.pac_avatar ? (

                                    <img
                                        src={prescricao.pac_avatar}
                                        alt={`Avatar de ${prescricao.pac_nome}`}
                                    />

                                ) : (

                                    <span>
                                        👤
                                    </span>

                                )}

                            </div>


                            {/* =========================
                                PACIENTE
                            ========================= */}

                            <div className="info-paciente">

                                <strong>
                                    {prescricao.pac_nome}
                                </strong>

                                <span>
                                    CPF: {prescricao.pac_cpf}
                                </span>

                                <span>
                                    COD: {prescricao.sol_id}
                                </span>

                            </div>


                            {/* =========================
                                INFORMAÇÕES
                            ========================= */}

                            <div className="info-envio">

                                <strong>
                                    Informações
                                </strong>

                                <span>
                                    Data de Env:{" "}

                                    {new Date(
                                        prescricao.sol_data_solicitacao
                                    ).toLocaleDateString(
                                        "pt-BR"
                                    )}
                                </span>

                                {prescricao.pos_nome && (

                                    <span>
                                        Posto:{" "}
                                        {prescricao.pos_nome}
                                    </span>

                                )}

                            </div>


                            {/* =========================
                                STATUS
                            ========================= */}

                            <div className="status-pendente">

                                Aprovado

                            </div>


                            {/* =========================
                                BOTÃO
                            ========================= */}

                            <button
                                className="btn-ver-mais"
                                onClick={() =>
                                    navigate(
                                        `/administrador/prescricao/autorizarprescricao/${prescricao.sol_id}`
                                    )
                                }
                            >
                                VER MAIS
                            </button>


                        </div>

                    ))}

                </div>

            </div>


            <Footer />

        </>

    );

}