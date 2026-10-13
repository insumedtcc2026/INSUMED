import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { buscarPrescricoesPendentes } from "../services/PrescricaoService";
import type { PrescricaoPendente } from "../services/PrescricaoService";



import { useValidarToken } from "../hook/Validartoken.tsx";

import Sidebaradm from "../components/universais/Siderbaradm.tsx";
import Header from "../components/universais/HeaderAdm.tsx";
import Footer from "../components/universais/Footer.tsx";

import "../css/home/VerSolicitaçoes.css";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { exibirCPF } from "../utils/validacoes";


export default function Pendencias() {

    const navigate = useNavigate();

    
    // ESTADOS


    

    const [busca, setBusca] =
        useState("");

    const [prescricoes, setPrescricoes] =
        useState<PrescricaoPendente[]>([]);

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [, setCarregando] =
        useState(true);
const [statusFiltro, setStatusFiltro] =
        useState("Todos");

   
    // VALIDAÇÃO DO TOKEN
  

    const { verificando } = useValidarToken("ADMIN");


    // SIDEBAR


    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
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
                statusFiltro === "Todos"
                ||
                prescricao.sol_status === statusFiltro;


            let correspondeData = true;




            return (
                correspondeBusca &&
                correspondeStatus &&
                correspondeData
            );
        });

 
    // BUSCAR PENDÊNCIAS


    useEffect(() => {

        carregarPrescricoes();

    }, []);


   
const carregarPrescricoes = async () => {
    try {
        setCarregando(true);

        const dados = await buscarPrescricoesPendentes();

        console.log("Pendências recebidas:", dados);

        setPrescricoes(dados);
    } catch (error) {
        console.error("Erro ao carregar pendências:", error);
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

            <div className="barra-voltar barra-voltar--logado">
              <BotaoVoltar para="/homeadmin" />
            </div>

                <h1>
                    Pendências
                </h1>


                {/* PESQUISA */}

                <div className="barra-pesquisa">

                    <input
                    type="text"
                    placeholder="Busque o Paciente por CPF ou Nome"
                    value={busca}
                    onChange={(e) =>
                        setBusca(e.target.value)
                    }
                />

                </div>
                
                 {/* FILTRO DE STATUS */}
<div className="barra-filtro">
    <select
        value={statusFiltro}
        onChange={(e) => setStatusFiltro(e.target.value)}
        aria-label="Filtrar por status"
    >
        <option value="Todos">Todos</option>
        <option value="Pendente">Pendente</option>
        <option value="Revisado">Revisado</option>
        <option value="Autorizado">Autorizado</option>
        <option value="Nao Autorizado">Não Autorizado</option>
    </select>
</div>


                {/* LISTA */}

                <div className="lista-pendencias">

                    {prescricoesFiltradas.length === 0 && (

                        <div className="sem-pendencias">

                            <h2>
                                Nenhuma pendência encontrada 🎉
                            </h2>

                        </div>

                    )}


                    {prescricoesFiltradas.map((prescricao) => (
                        

                        <div
                            className="card-pendencia"
                            key={prescricao.sol_id}
                        >

                            {/* ÍCONE */}

                            <div className="icone-paciente">

                                
                                {prescricao.pac_avatar}
                            </div>


                            {/* PACIENTE */}

                            <div className="info-paciente">

                                <strong>
                                    {prescricao.pac_nome}
                                </strong>

                                <span>
                                    CPF: {exibirCPF(prescricao.pac_cpf)}
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


     <div
    className={
        prescricao.sol_status === "Revisado"
            ? "status-revisado"
            : prescricao.sol_status === "Autorizado"
            ? "status-autorizado"
            : prescricao.sol_status === "Nao Autorizado"
            ? "status-nao-autorizado"
            : "status-pendente"
    }
>
    {prescricao.sol_status === "Nao Autorizado"
        ? "Não Autorizado"
        : prescricao.sol_status}

              
                 </div>

                            {/* BOTÃO */}
                    
<button
  className="btn-ver-mais"
  onClick={() => {
    if (prescricao.sol_status === "Autorizado" && prescricao.agendamento_ativo) {
      // já agendada: abre a lista de agendamentos filtrada pelo CPF
      navigate(`/Agendamentosadm?busca=${encodeURIComponent(prescricao.pac_cpf)}`);
    } else if (prescricao.sol_status === "Autorizado") {
      navigate(
        `/Agendamentosadm?cpf=${prescricao.pac_cpf}&sol_id=${prescricao.sol_id}`
      );
    } else if (prescricao.sol_status === "Nao Autorizado") {
      navigate(
  `/administrador/prescricao/nao-autorizada/${prescricao.sol_id}`
);
    } else {
      navigate(
        `/administrador/prescricao/autorizarprescricao/${prescricao.sol_id}`
      );
    }
  }}
>
  {prescricao.sol_status !== "Autorizado"
    ? "Ver mais"
    : prescricao.agendamento_ativo
    ? "Ver agendamento"
    : "Agendar"}
</button>
                        </div>

                    ))}
              
                </div>

            </div>
    <Footer />
        </>
    );
}