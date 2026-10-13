import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { useValidarToken } from "../hook/Validartoken.tsx";

import SidebarAut from "../components/universais/SidebarAut.tsx";
import Header from "../components/universais/HeaderAut.tsx";
import Footer from "../components/universais/Footer.tsx";

// Mesmo CSS da página do administrador, para ficar idêntica
import "../css/home/AutorizarPrescicoesAut.css";
import Swal from "sweetalert2";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import { MOTIVO_MAX, validarMotivo } from "../utils/validacoes";
import { exibirCPF } from "../utils/validacoes";


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
  sol_motivo_nao_autorizado?: string | null;
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
  console.log("TELA DO AUTORIZADOR CARREGADA");

  if (!id) {
    console.log("ID DA SOLICITAÇÃO NÃO ENCONTRADO");
    return;
  }

  let urlCriada: string | null = null;

  const carregarDados = async () => {
    console.log("ENTROU NA FUNÇÃO carregarDados");

    try {
      setCarregando(true);

        const token = localStorage.getItem("token_autorizador");

        // INFORMAÇÕES DA SOLICITAÇÃO
        const response = await axios.get<SolicitacaoAprovada>(
          `${API_URL}/autorizador/solicitacao/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

       setSolicitacao(response.data);


       

    // TESTE: verificar se o motivo está chegando do backend
    console.log("Dados recebidos:", response.data);
    console.log("Status:", response.data.sol_status);
    console.log(
      "Motivo da não autorização:",
      response.data.sol_motivo_nao_autorizado
    );

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

    } catch (error: any) {
        console.error("Erro ao atualizar prescrição:", error);

        await Swal.fire({
            icon: "error",
            title: "Ops...",
            text: error.response?.data?.error ||
                "Não foi possível atualizar a prescrição.",
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
    <div className="enviar-prescricao-page">

      <Header onMenuClick={toggleSidebar} />

      <SidebarAut
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
      />


      <main className="enviar-prescricao-content">

        <div className="barra-voltar barra-voltar--interna">
          <BotaoVoltar para="/verprescricoesaprovadas" />
        </div>

        <h1>Prescrição:</h1>

        {!carregando && !solicitacao ? (

          <p>Prescrição não encontrada.</p>

        ) : (
          <>
            <div className="prescricao-container">

              {/* IMAGEM DA PRESCRIÇÃO */}

              <section className="prescricao-preview">
                <div className="prescricao-imagem">

                  {carregando ? (
                    <p>Carregando prescrição...</p>
                  ) : imagemPrescricao ? (
                    <img
                      src={imagemPrescricao}
                      alt="Prescrição enviada pelo paciente"
                    />
                  ) : (
                    <p>Prescrição não encontrada.</p>
                  )}

                </div>
              </section>


              {/* INFORMAÇÕES DA PRESCRIÇÃO */}

              <section className="informacoes-prescricao">

                <h2>Informações da prescrição</h2>


                {/* NOME */}

                <div className="campo">
                  <label>Nome paciente</label>
                  <input
                    type="text"
                    value={solicitacao?.pac_nome || ""}
                    readOnly
                  />
                </div>


                {/* CPF + COD */}

                <div className="linha-campos">

                  <div className="campo">
                    <label>CPF:</label>
                    <input
                      type="text"
                      value={solicitacao?.pac_cpf ? exibirCPF(solicitacao.pac_cpf) : ""}
                      readOnly
                    />
                  </div>

                  <div className="campo">
                    <label>COD:</label>
                    <input
                      type="text"
                      value={solicitacao?.sol_id || ""}
                      readOnly
                    />
                  </div>

                </div>


                {/* DATAS */}

                <div className="linha-campos">

                  <div className="campo">
                    <label>DATA DE ENVIO:</label>
                    <input
                      type="text"
                      value={formatarData(solicitacao?.sol_data_solicitacao)}
                      readOnly
                    />
                  </div>

                  <div className="campo">
                    <label className= "label-vencimento">DATA DE VENCIMENTO:</label>
                    <input
                      type="text"
                      value={formatarData(solicitacao?.sol_data_vencimento, true)}
                      placeholder="Não informada"
                      readOnly
                    />
                  </div>

                </div>


                {/* UNIDADE DE SAÚDE */}

                <div className="campo">
                  <label>Unidade de Saúde</label>
                  <input
                    type="text"
                    value={solicitacao?.pos_nome || ""}
                    placeholder="Não informada"
                    readOnly
                  />
                </div>


                {/* INSUMO + QUANTIDADE */}

                <div className="linha-insumo">

                  <div className="ins-campo insumo-select">
                    <label className="ins-label">Insumo</label>
                   <input
            type="text"
            className="ins-input"
            value={solicitacao?.ins_nome || ""}
            readOnly
        />

                  </div>

                  <div className="ins-campo quantidade-campo">
                    <label className="ins-label">Quantidade</label>
                    <input
                      type="text"
                      className="ins-input"
                      value={solicitacao?.sol_insumo_quant ?? ""}
                      readOnly
                    />
                  </div>

                </div>


                {/* OBSERVAÇÃO */}

                <div className="campo">
                  <label className="observacao-label">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={solicitacao?.sol_observacao || ""}
                    placeholder="Nenhuma observação informada."
                    readOnly
                  />
                </div>

              </section>

            </div>
{solicitacao?.sol_status === "Nao Autorizado" && (
    <div className="campo">
        <label>Motivo da não autorização</label>

        <textarea
            value={solicitacao.sol_motivo_nao_autorizado ?? ""}
            placeholder="O motivo não foi registrado."
            readOnly
        />
    </div>
)}

{!somenteVisualizacao && (
    <div className="prescricao-buttons">
        <button
                className="btn-reenvio"
                type="button"
                disabled={processando || carregando}
                style={{ opacity: processando ? 0.6 : 1 }}
                onClick={() => alterarStatus("Nao Autorizado")}
              >
                NÃO AUTORIZAR
              </button>

              <button
                className="btn-enviar"
                type="button"
                disabled={processando || carregando}
                style={{ opacity: processando ? 0.6 : 1 }}
                onClick={() => alterarStatus("Autorizado")}
              >
                AUTORIZAR
              </button>
    </div>
)}


            {/* BOTÕES */}


          </>
        )}

      </main>

      <Footer />

    </div>
  );
}