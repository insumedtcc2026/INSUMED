import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { useValidarToken } from "../hook/Validartoken.tsx";

import SidebarAut from "../components/universais/SidebarAut.tsx";
import Header from "../components/universais/HeaderAut.tsx";
import Footer from "../components/universais/Footer.tsx";

// Mesmo CSS da página do administrador, para ficar idêntica
import "../css/universais/RevisaoPrescricao.css";
import Swal from "sweetalert2";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import VersoesPrescricao from "../components/universais/VersoesPrescricao";
import VisualizadorPrescricao, { SeloStatus } from "../components/universais/VisualizadorPrescricao";
import ModalHistorico from "../components/universais/ModalHistorico";
import { MOTIVO_MAX, mensagemErroApi, validarMotivo } from "../utils/validacoes";
import { exibirCPF } from "../utils/validacoes";
import { API_URL } from "../config";




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
  sol_motivo_nao_autorizado?: string | null;
  // observação da unidade quando ela refez um pedido não autorizado
  sol_observacao_equipe?: string | null;
  sol_insumo_quant: number;

  pac_nome: string;
  pac_cpf: string;
  pac_avatar?: string | null;

  pos_nome?: string | null;

  ins_nome?: string | null;
  ins_marca?: string | null;
}


// Formata datas para dd/mm/aaaa.
// utc = true evita que "2026-09-01" vire 31/08 por causa do fuso.
function formatarData(data?: string | null, utc = false) {
  if (!data) return "";

  return new Date(data).toLocaleDateString(
    "pt-BR",
    utc ? { timeZone: "UTC" } : undefined
  );
}


export default function AutorizarPrescricaoAutorizador() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { verificando } = useValidarToken("AUTORIZADOR");


  // =====================================================
  // ESTADOS
  // =====================================================

  const [solicitacao, setSolicitacao] =
    useState<SolicitacaoAprovada | null>(null);

  const [imagemPrescricao, setImagemPrescricao] =
    useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [verHistorico, setVerHistorico] = useState(false);


const somenteVisualizacao =
    solicitacao?.sol_status === "Autorizado" ||
    solicitacao?.sol_status === "Nao Autorizado";

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

  let urlCriada: string | null = null;

  const carregarDados = async () => {

    try {
      setCarregando(true);

        const token = localStorage.getItem("token_autorizador");

        // INFORMAÇÕES DA SOLICITAÇÃO
        const response = await axios.get<SolicitacaoAprovada>(
          `${API_URL}/autorizador/solicitacao/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

       setSolicitacao(response.data);


       


        // IMAGEM DA PRESCRIÇÃO
        const imagemResponse = await axios.get(
          `${API_URL}/autorizador/solicitacao/${id}/prescricao`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          }
        );

        urlCriada = URL.createObjectURL(imagemResponse.data);
        setImagemPrescricao(urlCriada);

      

} catch (error) {
    if (axios.isAxiosError(error)) {
        console.error("URL que falhou:", error.config?.url);
        console.error("Status HTTP:", error.response?.status);
        console.error("Resposta do backend:", error.response?.data);
    } else {
        console.error("Erro ao carregar prescrição:", error);
    }

    alert("Não foi possível carregar a prescrição.");
} finally {
    setCarregando(false);
}


    };

    carregarDados();

    // Libera a URL da imagem ao sair da página
    return () => {
      if (urlCriada) URL.revokeObjectURL(urlCriada);
    };

  }, [id]);


  // =====================================================
  // ALTERAR STATUS
  // =====================================================

 
const alterarStatus = async (
    status: "Autorizado" | "Nao Autorizado"
) => {
    if (!id) return;

    let motivo = "";

    // Solicita o motivo quando não autorizar
    if (status === "Nao Autorizado") {
        const resultado = await Swal.fire({
            title: "Não autorizar prescrição",
            text: "Informe o motivo da não autorização.",
            input: "textarea",
            inputPlaceholder: "Escreva o motivo aqui...",
            inputAttributes: {
                "aria-label": "Motivo da não autorização",
                maxlength: String(MOTIVO_MAX)
            },
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33",
            inputValidator: (valor) => validarMotivo(valor)
        });

        if (!resultado.isConfirmed) return;

        motivo = resultado.value.trim();
    }

    try {
        setProcessando(true);

        const token = localStorage.getItem("token_autorizador");

        await axios.patch(
            `${API_URL}/autorizador/solicitacao/${id}`,
            {
                sol_status: status,
                sol_motivo_nao_autorizado: motivo || null
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        await Swal.fire({
            icon: "success",
            title: status === "Autorizado"
                ? "Prescrição autorizada!"
                : "Prescrição não autorizada!",
            text: status === "Autorizado"
                ? "A prescrição foi autorizada com sucesso."
                : "O motivo da não autorização foi salvo.",
            confirmButtonText: "Continuar",
            confirmButtonColor: "#3085d6"
        });

        navigate("/verprescricoesaprovadas");

    } catch (error) {
        console.error("Erro ao atualizar prescrição:", error);

        await Swal.fire({
            icon: "error",
            title: "Não foi possível salvar a decisão",
            text: mensagemErroApi(error, "Não foi possível atualizar a prescrição."),
            confirmButtonColor: "#d33"
        });
    } finally {
        setProcessando(false);
    }
};
  // =====================================================
  // VALIDANDO TOKEN
  // =====================================================

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando seus dados...</p>
      </div>
    );
  }


  // =====================================================
  // PÁGINA
  // =====================================================

  return (
    <div className="rvp-pagina">

      <Header onMenuClick={toggleSidebar} />

      <SidebarAut
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
      />

      <main className="rvp-main">

        <div className="barra-voltar barra-voltar--interna">
          <BotaoVoltar para="/verprescricoesaprovadas" />
        </div>

        <header className="rvp-cabecalho">
          <div>
            <p className="rvp-sobretitulo">Autorização da prescrição</p>
            <h1 className="rvp-titulo">Prescrição nº {id}</h1>
            {solicitacao?.pac_nome && (
              <p className="rvp-subtitulo">
                Paciente: <strong>{solicitacao.pac_nome}</strong>
              </p>
            )}
          </div>
          <SeloStatus status={solicitacao?.sol_status} />
        </header>

        {!carregando && !solicitacao ? (

          <p className="rvp-estado rvp-estado--erro" role="alert">Prescrição não encontrada.</p>

        ) : (
          <>
            <div className="rvp-grade">

              <VisualizadorPrescricao
                url={imagemPrescricao}
                pdf={solicitacao?.sol_prescricao_tipo === "application/pdf"}
                carregando={carregando}
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
                      <dd>{solicitacao?.pac_nome || "-"}</dd>
                    </div>
                    <div className="rvp-dado">
                      <dt>CPF</dt>
                      <dd>{solicitacao?.pac_cpf ? exibirCPF(solicitacao.pac_cpf) : "-"}</dd>
                    </div>
                    <div className="rvp-dado">
                      <dt>Código do pedido</dt>
                      <dd>{solicitacao?.sol_id ?? id}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rvp-grupo">
                  <h3 className="rvp-grupo-titulo">Prescrição</h3>
                  <dl className="rvp-dados">
                    <div className="rvp-dado">
                      <dt>Enviada em</dt>
                      <dd>{formatarData(solicitacao?.sol_data_solicitacao) || "-"}</dd>
                    </div>
                    <div className="rvp-dado">
                      <dt>Vencimento</dt>
                      <dd className={solicitacao?.sol_data_vencimento ? undefined : "rvp-vazio"}>
                        {formatarData(solicitacao?.sol_data_vencimento, true) || "Não informado"}
                      </dd>
                    </div>
                    <div className="rvp-dado rvp-dado--inteiro">
                      <dt>Unidade de saúde</dt>
                      <dd className={solicitacao?.pos_nome ? undefined : "rvp-vazio"}>
                        {solicitacao?.pos_nome || "Não informada"}
                      </dd>
                    </div>
                    <div className="rvp-dado">
                      <dt>Insumo</dt>
                      <dd className={solicitacao?.ins_nome ? undefined : "rvp-vazio"}>
                        {solicitacao?.ins_nome
                          ? `${solicitacao.ins_nome}${solicitacao.ins_marca ? ` - ${solicitacao.ins_marca}` : ""}`
                          : "Não informado"}
                      </dd>
                    </div>
                    <div className="rvp-dado">
                      <dt>Quantidade</dt>
                      <dd>{solicitacao?.sol_insumo_quant ?? "-"}</dd>
                    </div>
                    <div className="rvp-dado rvp-dado--inteiro">
                      <dt>Observações do paciente</dt>
                      <dd className={solicitacao?.sol_observacao ? undefined : "rvp-vazio"}>
                        {solicitacao?.sol_observacao ? (
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

            {solicitacao?.sol_observacao_equipe && (
              <div className="rvp-aviso" role="note">
                <p className="rvp-aviso-titulo">Observação da unidade (pedido refeito)</p>
                <p>{solicitacao.sol_observacao_equipe}</p>
              </div>
            )}

            {solicitacao?.sol_status === "Nao Autorizado" && (
              <div className="rvp-aviso rvp-aviso--erro" role="note">
                <p className="rvp-aviso-titulo">Motivo da não autorização</p>
                <p>{solicitacao.sol_motivo_nao_autorizado || "O motivo não foi registrado."}</p>
              </div>
            )}

            <div className="rvp-extras">
              {id && <VersoesPrescricao sol_id={Number(id)} perfil="AUTORIZADOR" />}
              <button
                type="button"
                onClick={() => setVerHistorico(true)}
                className="rvp-link-botao"
              >
                Ver histórico
              </button>
            </div>

            {!somenteVisualizacao && (
              <div className="rvp-acoes">
                <div className="rvp-acoes-linha">
                  <p className="rvp-acoes-texto">Confira a receita e os dados antes de decidir.</p>
                  <div className="rvp-acoes-botoes">
                    <button
                      className="rvp-botao rvp-botao--perigo"
                      type="button"
                      disabled={processando || carregando}
                      onClick={() => alterarStatus("Nao Autorizado")}
                    >
                      Não autorizar
                    </button>

                    <button
                      className="rvp-botao rvp-botao--sucesso"
                      type="button"
                      disabled={processando || carregando}
                      onClick={() => alterarStatus("Autorizado")}
                    >
                      {processando ? "Salvando..." : "Autorizar"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </>
        )}

      </main>

      {verHistorico && id && (
        <ModalHistorico
          sol_id={Number(id)}
          perfil="AUTORIZADOR"
          titulo={`Histórico da prescrição nº ${id}`}
          onClose={() => setVerHistorico(false)}
        />
      )}

      <Footer />

    </div>
  );
}
