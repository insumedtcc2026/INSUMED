import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { useValidarToken } from "../hook/Validartoken.tsx";

import Sidebaradm from "../components/universais/Siderbaradm.tsx";
import Header from "../components/universais/HeaderAut.tsx";
import Footer from "../components/universais/Footer.tsx";

// Mesmo CSS da página do administrador, para ficar idêntica
import "../css/home/AutorizarPrescicoesAut.css";
import Swal from "sweetalert2";
import BotaoVoltar from "../components/universais/BotaoVoltar";


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
  const { verificando } = useValidarToken();


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


  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };


  // =====================================================
  // BUSCAR DADOS
  // =====================================================

  useEffect(() => {

    if (!id) return;

    let urlCriada: string | null = null;

    const carregarDados = async () => {
      try {
        setCarregando(true);

        const token = localStorage.getItem("token");

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
        console.error("Erro ao buscar prescrição:", error);
        alert("Não foi possível carregar a prescrição.");
        navigate("/verprescricoesaprovadas");
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

    try {
      setProcessando(true);

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/autorizador/solicitacao/${id}`,
        { sol_status: status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
        Swal.fire({
          icon: 'success',
          title: 'Prescriação autorizada com sucesso!',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ir para solicitaçoes '
        })

      navigate("/verprescricoesaprovadas");

    } catch (error: any) {
      console.error("Erro ao autorizar prescrição:", error);

       await Swal.fire({
        icon: 'error',
        title: 'Ops...',
        text: error.response?.data?.error ||
              error.response?.data?.message ||
              'Ocorreu um erro ao autorizar a prescrição. Por favor, tente novamente.',
        confirmButtonColor: '#d33'
      });
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

      <Sidebaradm
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
                      value={solicitacao?.pac_cpf || ""}
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

                  <div className="campo vencimento">
                    <label>DATA DE VENCIMENTO:</label>
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


            {/* BOTÕES */}

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
          </>
        )}

      </main>

      <Footer />

    </div>
  );
}