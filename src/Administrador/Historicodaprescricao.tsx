import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {buscarHistoricoPrescricoes} from "../services/PrescricaoService";
import type {HistoricoPrescricao} from "../services/PrescricaoService";
import Header from "../components/universais/HeaderAdm";
import Sidebar from "../components/universais/Siderbaradm";


import "../css/home/Historicodaprescricao.css";


export default function Historico() {
    

    const navigate = useNavigate();

    const [prescricoes, setPrescricoes] =
        useState<HistoricoPrescricao[]>([]);

    const [busca, setBusca] =
        useState("");

    const [statusFiltro, setStatusFiltro] =
        useState("TODOS");

    const [dataInicio, setDataInicio] =
        useState("");

    const [dataFim, setDataFim] =
        useState("");

    const [carregando, setCarregando] =
        useState(true);
const [sidebarOpen, setSidebarOpen] = useState(false);


    useEffect(() => {

        carregarHistorico();

    }, []);


  const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };
    const carregarHistorico = async () => {

        try {

            setCarregando(true);

            const dados =
                await buscarHistoricoPrescricoes();

            setPrescricoes(dados);

        } catch (error) {

            console.error(
                "Erro ao carregar histórico:",
                error
            );

        } finally {

            setCarregando(false);
        }
    };


    const prescricoesFiltradas =
        prescricoes.filter((prescricao) => {

            const termo =
                busca.toLowerCase();

            const correspondeBusca =
                prescricao.pac_nome
                    .toLowerCase()
                    .includes(termo)
                ||
                prescricao.pac_cpf
                    .toLowerCase()
                    .includes(termo);


            const correspondeStatus =
                statusFiltro === "TODOS"
                ||
                prescricao.sol_status === statusFiltro;


            let correspondeData = true;




            return (
                correspondeBusca &&
                correspondeStatus &&
                correspondeData
            );
        });


    const formatarData = (
        data?: string
    ) => {

        if (!data) return "--/--/----";

        return new Date(data)
            .toLocaleDateString("pt-BR");
    };
      

    if (carregando) {

        return (
            <div className="historico-loading">
                Carregando histórico...
            </div>
        );
    }


    return (
<>
            <Header
                
                 onMenuClick={toggleSidebar}
                
              />
        
              <Sidebar
                isOpen={sidebarOpen}
                        onClose={toggleSidebar}
              />

        <div className="historico-page">

            <h1>HISTÓRICO</h1>


            {/* PESQUISA */}

            <div className="historico-pesquisa">

                <span>⌕</span>

                <input
                    type="text"
                    placeholder="Search"
                    value={busca}
                    onChange={(e) =>
                        setBusca(e.target.value)
                    }
                />

            </div>

            {/* FILTROS */}
            <div className="historico-container">

            <div className="historico-filtros">

                <select
                    value={statusFiltro}
                    onChange={(e) =>
                        setStatusFiltro(e.target.value)
                    }
                >

                    <option value="TODOS">
                        Todos os status
                    </option>

                    <option value="Aprovado">
                        Aprovada
                    </option>

                    <option value="Reenvio">
                        Reenvio
                    </option>

                </select>
<div className="filtro-datas">

                <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) =>
                        setDataInicio(e.target.value)
                    }
                />


                <span>até</span>


                <input
                    type="date"
                    value={dataFim}
                    onChange={(e) =>
                        setDataFim(e.target.value)
                    }
                />
</div>
            </div>
</div>




            {/* CARDS */}

            <div className="historico-lista">

                {prescricoesFiltradas.length === 0 && (

                    <div className="sem-historico">

                        Nenhuma prescrição encontrada.

                    </div>
                )}


                {prescricoesFiltradas.map(
                    (prescricao) => (
                         

                    <div
                        className="historico-card"
                        key={prescricao.sol_id}
                    >

                        {/* ÍCONE */}
                     <div className="historico-avatar">
                        {prescricao.pac_avatar}
                        </div>

                        {/* PACIENTE */}

                        <div className="historico-paciente">

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


                        {/* INSUMOS */}

                        <div className="historico-insumos">

                            <strong>
                                Insumos
                            </strong>

                            <span>
                                {prescricao.ins_nome
                                    ? `10x ${prescricao.ins_nome}`
                                    : "Não informado"}
                            </span>

                        </div>


                        {/* INFORMAÇÕES */}

                        <div className="historico-informacoes">

                            <strong>
                                Informações
                            </strong>

                            <span>
                                Data de Env:{" "}
                                {formatarData(
                                    prescricao.sol_data_solicitacao
                                )}
                            </span>

                            <span>
                                Data de Análise:{" "}
                                {formatarData(
                                    prescricao.sol_data_analise
                                )}
                            </span>

                        </div>


                        {/* STATUS */}

                        <div
                            className={
                                `historico-status ${
                                    prescricao.sol_status ===
                                    "Aprovado"
                                        ? "aprovada"
                                        : "reenvio"
                                }`
                            }
                        >

                            {prescricao.sol_status ===
                            "Aprovado"
                                ? "Aprovado"
                                : "Reenvio"}

                        </div>


                        {/* VER MAIS */}

                        <button
                            className="historico-vermais"
                            onClick={() =>
                                navigate(
                                    `/administrador/prescricao/autorizarprescricao/${prescricao.sol_id}`
                             )
                                
                            }
                        >

                            Ver mais
                            <span></span>

                        </button>


                    </div>

                ))}

            </div>

        </div>
        </>
    );
}