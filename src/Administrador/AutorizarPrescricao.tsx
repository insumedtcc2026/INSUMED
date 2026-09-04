import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Header from "../components/universais/Header";
import Sidebar from "../components/universais/Sidebar";


import "../css/home/AutorizarPrescricao.css";

interface Solicitacao {
  sol_id: number;
  pac_id: number;
  pos_id: number;
  sol_data_solicitacao: string;
  sol_status: string;
  sol_observacao: string | null;

  pac_nome: string;
  pac_cpf: string;

  pos_nome: string;
}

function EnviarPrescricao() {

  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [imagem, setImagem] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);

  const [solicitacao, setSolicitacao] =
    useState<Solicitacao | null>(null);

const [mostrarMotivos, setMostrarMotivos] = useState(false);

const [motivo, setMotivo] = useState("");
  // ==========================================
  // BUSCAR DADOS DA SOLICITAÇÃO E PRESCRIÇÃO
  // ==========================================

  useEffect(() => {

    const buscarDados = async () => {

      try {

        const token = localStorage.getItem("token");


        // ==========================================
        // BUSCAR DADOS DA SOLICITAÇÃO
        // ==========================================

        const dadosResponse = await axios.get(
          //`http://localhost:3344/solicitacao/${id}`,
          `https://backend-insumed-lhac.vercel.app/solicitacao/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Dados da solicitação:",
          dadosResponse.data
        );

        setSolicitacao(dadosResponse.data);


        // ==========================================
        // BUSCAR IMAGEM DA PRESCRIÇÃO
        // ==========================================

        const imagemResponse = await axios.get(
          `http://localhost:3344/solicitacao/${id}/prescricao`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          }
        );

        const url = URL.createObjectURL(
          imagemResponse.data
        );

        setImagem(url);


      } catch (error) {

        console.error(
          "Erro ao buscar solicitação:",
          error
        );

      } finally {

        setCarregando(false);

      }

    };


    if (id) {
      buscarDados();
    }

  }, [id]);

  const confirmarReenvio = async () => {

  if (!motivo) {
    alert("Selecione um motivo.");
    return;
  }

  try {

    const token = localStorage.getItem("token");

    await axios.patch(
      `http://localhost:3344/solicitacao/${id}/reenvio`,
      {
        motivo: "motivo"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Pedido de reenvio enviado com sucesso!");

    setMostrarMotivos(false);

  } catch (error: any) {

    console.error(
      "Erro ao pedir reenvio:",
      error
    );

    alert(
      error.response?.data?.error ||
      "Erro ao pedir reenvio."
    );
  }
};

const enviarSolicitacao = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Token não encontrado.");
      return;
    }

    await axios.patch(
      `http://localhost:3344/solicitacoes/${id}`,
      {
        sol_status: "Aprovado"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Prescrição autorizada com sucesso!");

  } catch (error: any) {

    console.error(
      "Erro ao autorizar prescrição:",
      error
    );

    console.error(
      "Resposta do servidor:",
      error.response?.data
    );

    alert(
      error.response?.data?.error ||
      "Erro ao autorizar prescrição."
    );
  }
};


  return (

    <div className="enviar-prescricao-page">

      <Header
        onMenuClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />


      <main className="enviar-prescricao-content">

        <h1>Prescrição:</h1>


        <div className="prescricao-container">


          {/* ==================================
              IMAGEM DA PRESCRIÇÃO
          ================================== */}

          <section className="prescricao-preview">

            <div className="prescricao-imagem">

              {carregando ? (

                <p>
                  Carregando prescrição...
                </p>

              ) : imagem ? (

                <img
                  src={imagem}
                  alt="Prescrição enviada pelo paciente"
                />

              ) : (

                <p>
                  Prescrição não encontrada.
                </p>

              )}

            </div>

          </section>


          {/* ==================================
              INFORMAÇÕES DA PRESCRIÇÃO
          ================================== */}

          <section className="informacoes-prescricao">

            <h2>
              Informações da prescrição
            </h2>


            {/* NOME */}

            <div className="campo">

              <label>
                Nome paciente
              </label>

              <input
                type="text"
                value={
                  solicitacao?.pac_nome || ""
                }
                readOnly
              />

            </div>


            {/* CPF + COD */}

            <div className="linha-campos">

              <div className="campo">

                <label>
                  CPF:
                </label>

                <input
                  type="text"
                  value={
                    solicitacao?.pac_cpf || ""
                  }
                  readOnly
                />

              </div>


              <div className="campo">

                <label>
                  COD:
                </label>

                <input
                  type="text"
                  value={
                    solicitacao?.sol_id || ""
                  }
                  readOnly
                />

              </div>

            </div>


            {/* DATAS */}

            <div className="linha-campos">

              <div className="campo">

                <label>
                  DATA DE ENVIO:
                </label>

                <input
                  type="text"
                  value={
                    solicitacao
                      ? new Date(
                          solicitacao.sol_data_solicitacao
                        ).toLocaleDateString("pt-BR")
                      : ""
                  }
                  readOnly
                />

              </div>


              <div className="campo vencimento">

                <label>
                  DATA DE VENCIMENTO:
                </label>

                <input
                  type="text"
                  value="Data máxima de resposta..."
                  readOnly
                />

              </div>

            </div>


            {/* UNIDADE DE SAÚDE */}

            <div className="campo">

              <label>
                Unidade de Saúde
              </label>

              <input
                type="text"
                value={
                  solicitacao?.pos_nome || ""
                }
                readOnly
              />

            </div>


            {/* OBSERVAÇÃO */}

            <div className="campo">

              <label>
                Observações (opcional)
              </label>

              <textarea
                value={
                  solicitacao?.sol_observacao || ""
                }
                readOnly
                placeholder="Digite alguma informação, caso necessário"
              />

            </div>

          </section>

        </div>


        {/* ==================================
            MOTIVOS
        ================================== */}

       <div className="prescricao-buttons">

  <div className="reenvio-area">

    <button
      className="btn-reenvio"
      type="button"
      onClick={() => setMostrarMotivos(!mostrarMotivos)}
    >
      PEDIR REENVIO
    </button>

    {mostrarMotivos && (
      <section className="motivos">

        <h2>Motivo:</h2>

        <label>
          <input
            type="radio"
            name="motivo"
            value="FOTO_SEM_QUALIDADE"
            checked={motivo === "FOTO_SEM_QUALIDADE"}
            onChange={(e) => setMotivo(e.target.value)}
          />
          FOTO SEM QUALIDADE
        </label>

        <label>
          <input
            type="radio"
            name="motivo"
            value="PRESCRICAO_VENCIDA"
            checked={motivo === "PRESCRICAO_VENCIDA"}
            onChange={(e) => setMotivo(e.target.value)}
          />
          PRESCRIÇÃO VENCIDA
        </label>

        <label>
          <input
            type="radio"
            name="motivo"
            value="INFORMACAO_DIFERENTE"
            checked={motivo === "INFORMACAO_DIFERENTE"}
            onChange={(e) => setMotivo(e.target.value)}
          />
          INFORMAÇÃO DIFERENTE
        </label>

        <label>
          <input
            type="radio"
            name="motivo"
            value="OUTRO"
            checked={motivo === "OUTRO"}
            onChange={(e) => setMotivo(e.target.value)}
          />
          OUTRO...
        </label>

        <button
          type="button"
          className="btn-enviar"
          onClick={confirmarReenvio}
        >
          CONFIRMAR REENVIO
        </button>

      </section>
    )}

  </div>

  <button
  className="btn-enviar"
  type="button"
  onClick={enviarSolicitacao}
>
  ENVIAR
</button>

  </div>


      </main>

    </div>
  );
}

export default EnviarPrescricao;