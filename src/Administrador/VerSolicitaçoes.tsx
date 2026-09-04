import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { buscarPrescricoesPendentes } from "../services/PrescricaoService";
import type { PrescricaoPendente } from "../services/PrescricaoService";

import type { Paciente } from "../types/agendamento";
import { buscarPacientesPorCpf } from "../services/PacientesServices";

import { useValidarToken } from "../hook/Validartoken.tsx";

import Sidebaradm from "../components/universais/Siderbaradm.tsx";
import Header from "../components/universais/HeaderAdm.tsx";

import "../css/home/VerSolicitaçoes.css";


export default function Pendencias() {

    const navigate = useNavigate();

    // =========================
    // ESTADOS
    // =========================

    const [cpf, setCpf] = useState("");

    const [, setPacientes] =
        useState<Paciente[]>([]);

    const [prescricoes, setPrescricoes] =
        useState<PrescricaoPendente[]>([]);

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
    // BUSCAR PENDÊNCIAS
    // =========================

    useEffect(() => {

        carregarPrescricoes();

    }, []);


    const carregarPrescricoes = async () => {

        try {

            setCarregando(true);

            const dados =
                await buscarPrescricoesPendentes();

            console.log(
                "Pendências recebidas:",
                dados
            );

            setPrescricoes(dados);

        } catch (error) {

            console.error(
                "Erro ao carregar pendências:",
                error
            );

        } finally {

            setCarregando(false);

        }
    };


    // =========================
    // BUSCAR PACIENTE POR CPF
    // =========================

    const handleBuscar = async (valor: string) => {

        setCpf(valor);

        if (!valor.trim()) {

            setPacientes([]);

            return;
        }

        setCarregando(true);

        try {

            const resultado =
                await buscarPacientesPorCpf(valor);

            setPacientes(resultado);

        } catch (error) {

            console.error(
                "Erro ao buscar paciente:",
                error
            );

        } finally {

            setCarregando(false);

        }
    };


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


    // =========================
    // PÁGINA
    // =========================

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
                    Pendências
                </h1>


                {/* PESQUISA */}

                <div className="barra-pesquisa">

                    <input
                        id="cpf"
                        type="text"
                        value={cpf}
                        onChange={(e) =>
                            handleBuscar(e.target.value)
                        }
                        placeholder="🔍 Digite o CPF"
                    />

                </div>


                {/* LISTA */}

                <div className="lista-pendencias">

                    {prescricoes.length === 0 && (

                        <div className="sem-pendencias">

                            <h2>
                                Nenhuma pendência encontrada 🎉
                            </h2>

                        </div>

                    )}


                    {prescricoes.map((prescricao) => (

                        <div
                            className="card-pendencia"
                            key={prescricao.sol_id}
                        >

                            {/* ÍCONE */}

                            <div className="icone-paciente">
                                👤
                            </div>


                            {/* PACIENTE */}

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


                            {/* INFORMAÇÕES */}

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

                            </div>


                            {/* STATUS */}

                            <div className="status-pendente">
                                Pendente
                            </div>


                            {/* BOTÃO */}

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

        </>
    );
}