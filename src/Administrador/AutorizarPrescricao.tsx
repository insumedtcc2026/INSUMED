import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import Header from "../components/universais/HeaderAdm";
import Sidebar from "../components/universais/Siderbaradm";
import { useNavigate } from "react-router-dom";
import { useDadosInsumos } from "../hook/Insumosposto";
import { useValidarToken } from "../hook/Validartoken";

import "../css/universais/RevisaoPrescricao.css";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import ModalHistorico from "../components/universais/ModalHistorico";
import VersoesPrescricao from "../components/universais/VersoesPrescricao";
import VisualizadorPrescricao, { SeloStatus } from "../components/universais/VisualizadorPrescricao";
import { exibirCPF, mensagemErroApi } from "../utils/validacoes";
import { API_URL } from "../config";


 
interface Solicitacao {
  sol_id: number;
  pac_id: number;
  pos_id: number;
  sol_data_solicitacao: string;
  sol_status: string;
  sol_observacao: string | null;
sol_motivo_nao_autorizado?: string | null;
  sol_data_vencimento:string|null;
  sol_prescricao_tipo?: string | null;

  pac_nome: string;
  pac_cpf: string;

  pos_nome: string;
}

const MOTIVOS_REENVIO = [
  { valor: "FOTO_SEM_QUALIDADE", texto: "Foto sem qualidade" },
  { valor: "PRESCRICAO_VENCIDA", texto: "Prescrição vencida" },
  { valor: "INFORMACAO_DIFERENTE", texto: "Informação diferente" },
  { valor: "OUTRO", texto: "Outro motivo" },
];

function EnviarPrescricao() {

  const { verificando } = useValidarToken("ADMIN");
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [imagem, setImagem] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);
 

 const {
  insumos,
 
} = useDadosInsumos();

const [insumoMovId, setInsumoMovId] = useState("");

const [quantidade, setQuantidade] = useState("");
const listaInsumos = insumos ?? [];

  const navigate = useNavigate();
  const [verHistorico, setVerHistorico] = useState(false);
  const [dataVencimento, setDataVencimento] = useState("");
   
    

  const [solicitacao, setSolicitacao] =
    useState<Solicitacao | null>(null);
     
const somenteVisualizacao =
    solicitacao?.sol_status === "Revisado" ||
    solicitacao?.sol_status === "Autorizado" ||
    solicitacao?.sol_status === "Nao Autorizado";

const [mostrarMotivos, setMostrarMotivos] = useState(false);

const [motivo, setMotivo] = useState("");
 
  // BUSCAR DADOS DA SOLICITAÇÃO E PRESCRIÇÃO


  useEffect(() => {

    const buscarDados = async () => {

      try {

        const token = localStorage.getItem("token_admin");


      
        // BUSCAR DADOS DA SOLICITAÇÃO
        

        const dadosResponse = await axios.get(
          //`http://localhost:3344/solicitacao/${id}`,
          `${API_URL}/solicitacao/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

       setSolicitacao(dadosResponse.data);

       setInsumoMovId(
  dadosResponse.data.ins_id
    ? String(dadosResponse.data.ins_id)
    : ""
);

setQuantidade(
  dadosResponse.data.sol_insumo_quant != null
    ? String(dadosResponse.data.sol_insumo_quant)
    : ""
);

setDataVencimento(
  dadosResponse.data.sol_data_vencimento
    ? dadosResponse.data.sol_data_vencimento.substring(0, 10)
    : ""
);

        // BUSCAR IMAGEM DA PRESCRIÇÃO
        

        const imagemResponse = await axios.get(
          `${API_URL}/solicitacao/${id}/prescricao`,
          //`http://localhost:3344/solicitacao/${id}/prescricao`,
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
    await Swal.fire({ icon: "warning", title: "Motivo do reenvio", text: "Selecione o motivo do pedido de reenvio.", confirmButtonColor: "#3085d6" });
    return;
  }

  try {

    const token = localStorage.getItem("token_admin");

    await axios.patch(
     `${API_URL}/solicitacao/${id}/reenvio`,
      {
        motivo: motivo
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setMostrarMotivos(false);
    // reenvio não é aprovação: a mesma solicitação volta para o paciente corrigir
    await Swal.fire({
      icon: 'info',
      title: 'Reenvio solicitado',
      text: 'O paciente vai ver o motivo e poderá reenviar a prescrição dentro desta mesma solicitação.',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Voltar para as solicitações'
    });
    navigate('/VerSolicitaçoes');

  } catch (error) {

    console.error("Erro ao pedir reenvio:", error);

    await Swal.fire({
      icon: 'error',
      title: 'Não foi possível pedir o reenvio',
      text: mensagemErroApi(error, 'Ocorreu um erro ao pedir reenvio. Por favor, tente novamente.'),
      confirmButtonColor: '#d33'
    });
  }
};


  const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };


const enviarSolicitacao = async () => {
  try {
    const token = localStorage.getItem("token_admin");

    if (!token) {
      alert("Token não encontrado.");
      return;
    }
     if (!dataVencimento) {
      await Swal.fire({
        icon: "warning",
        title: "Data de vencimento",
        text: "Informe a data de vencimento da prescrição antes de enviar para o autorizador.",
        confirmButtonColor: "#3085d6"
      });

      return;
    }

    await axios.patch(
      `${API_URL}/solicitacao/${id}`,
      //`http://localhost:3344/solicitacoes/${id}`,
      {
         sol_status: "Revisado",
    sol_data_vencimento: dataVencimento,
    ins_id: Number(insumoMovId),
    sol_insumo_quant: Number(quantidade)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // A revisão NÃO aprova nem autoriza: ela confere os dados e envia a
    // prescrição para o autorizador decidir. A mensagem só aparece depois
    // que o backend confirmou a gravação.
    await Swal.fire({
      icon: 'success',
      title: 'Prescrição revisada',
      text: 'A prescrição foi revisada e enviada para análise do autorizador.',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Voltar para as solicitações'
    });
    navigate('/VerSolicitaçoes');
  } catch (error) {

    console.error("Erro ao revisar prescrição:", error);

    await Swal.fire({
      icon: 'error',
      title: 'Não foi possível revisar',
      text: mensagemErroApi(error, 'Ocorreu um erro ao revisar a prescrição. Por favor, tente novamente.'),
      confirmButtonColor: '#d33'
    });
  }
};


  // só o perfil de administrador abre esta tela
  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const vazio = (valor?: string | number | null) => (valor === null || valor === undefined || valor === "" ? "rvp-vazio" : undefined);

  return (
    <div className="rvp-pagina">
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <main className="rvp-main">
        <div className="barra-voltar barra-voltar--interna">
          <BotaoVoltar para="/versolicitaçoes" />
        </div>

        <header className="rvp-cabecalho">
          <div>
            <p className="rvp-sobretitulo">Revisão da prescrição</p>
            <h1 className="rvp-titulo">Prescrição nº {id}</h1>
            {solicitacao?.pac_nome && (
              <p className="rvp-subtitulo">
                Paciente: <strong>{solicitacao.pac_nome}</strong>
              </p>
            )}
          </div>
          <SeloStatus status={solicitacao?.sol_status} />
        </header>

        <div className="rvp-grade">
          <VisualizadorPrescricao
            url={imagem}
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
                  <dd className={vazio(solicitacao?.pac_nome)}>{solicitacao?.pac_nome || "Não informado"}</dd>
                </div>
                <div className="rvp-dado">
                  <dt>CPF</dt>
                  <dd className={vazio(solicitacao?.pac_cpf)}>
                    {solicitacao?.pac_cpf ? exibirCPF(solicitacao.pac_cpf) : "Não informado"}
                  </dd>
                </div>
                <div className="rvp-dado">
                  <dt>Código do pedido</dt>
                  <dd>{solicitacao?.sol_id ?? id}</dd>
                </div>
              </dl>
            </div>

            <div className="rvp-grupo">
              <h3 className="rvp-grupo-titulo">Pedido</h3>
              <dl className="rvp-dados">
                <div className="rvp-dado">
                  <dt>Enviada em</dt>
                  <dd>
                    {solicitacao
                      ? new Date(solicitacao.sol_data_solicitacao).toLocaleDateString("pt-BR")
                      : "-"}
                  </dd>
                </div>
                <div className="rvp-dado">
                  <dt>Unidade de saúde</dt>
                  <dd className={vazio(solicitacao?.pos_nome)}>{solicitacao?.pos_nome || "Não informada"}</dd>
                </div>
                <div className="rvp-dado rvp-dado--inteiro">
                  <dt>Observações do paciente</dt>
                  <dd className={vazio(solicitacao?.sol_observacao)}>
                    {solicitacao?.sol_observacao ? (
                      <p className="rvp-texto-livre">{solicitacao.sol_observacao}</p>
                    ) : (
                      "Nenhuma observação."
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rvp-grupo">
              <h3 className="rvp-grupo-titulo">Conferência da unidade</h3>
              <div className="rvp-campos">
                <div className="rvp-campo rvp-campo--inteiro">
                  <label className="rvp-rotulo" htmlFor="rvp-vencimento">
                    Vencimento da prescrição {!somenteVisualizacao && <span className="rvp-obrigatorio">*</span>}
                  </label>
                  <input
                    id="rvp-vencimento"
                    type="date"
                    className="rvp-input"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    disabled={somenteVisualizacao}
                  />
                  {!somenteVisualizacao && (
                    <p className="rvp-dica">Confira a data escrita na receita.</p>
                  )}
                </div>

                <div className="rvp-campo">
                  <label className="rvp-rotulo" htmlFor="rvp-insumo">Insumo</label>
                  <select
                    id="rvp-insumo"
                    className="rvp-input"
                    value={insumoMovId}
                    onChange={(e) => setInsumoMovId(e.target.value)}
                    disabled={somenteVisualizacao}
                  >
                    <option value="">Selecione o insumo</option>
                    {listaInsumos.map((insumo) => (
                      <option key={insumo.ins_id} value={insumo.ins_id}>
                        {insumo.ins_nome}
                        {insumo.ins_marca ? ` - ${insumo.ins_marca}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rvp-campo">
                  <label className="rvp-rotulo" htmlFor="rvp-quantidade">Quantidade</label>
                  <input
                    id="rvp-quantidade"
                    type="number"
                    min="1"
                    className="rvp-input"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="Qtd."
                    disabled={somenteVisualizacao}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {solicitacao?.sol_status === "Nao Autorizado" && (
          <div className="rvp-aviso rvp-aviso--erro" role="note">
            <p className="rvp-aviso-titulo">Motivo da não autorização</p>
            <p>{solicitacao.sol_motivo_nao_autorizado?.trim() || "Motivo não informado."}</p>
          </div>
        )}

        <div className="rvp-extras">
          {id && <VersoesPrescricao sol_id={Number(id)} perfil="ADMIN" />}
          <button type="button" onClick={() => setVerHistorico(true)} className="rvp-link-botao">
            Ver histórico
          </button>
        </div>

        {!somenteVisualizacao && (
          <div className="rvp-acoes">
            {mostrarMotivos && (
              <fieldset className="rvp-motivos">
                <legend>Por que a prescrição precisa ser reenviada?</legend>
                <div className="rvp-opcoes">
                  {MOTIVOS_REENVIO.map((m) => (
                    <label key={m.valor} className="rvp-opcao">
                      <input
                        type="radio"
                        name="motivo"
                        value={m.valor}
                        checked={motivo === m.valor}
                        onChange={(e) => setMotivo(e.target.value)}
                      />
                      {m.texto}
                    </label>
                  ))}
                </div>
                <div className="rvp-motivos-rodape">
                  <button type="button" className="rvp-botao rvp-botao--primario" onClick={confirmarReenvio}>
                    Confirmar pedido de reenvio
                  </button>
                </div>
              </fieldset>
            )}

            <div className="rvp-acoes-linha">
              <p className="rvp-acoes-texto">Revise os dados e envie para o autorizador decidir.</p>
              <div className="rvp-acoes-botoes">
                <button
                  className="rvp-botao rvp-botao--perigo"
                  type="button"
                  aria-expanded={mostrarMotivos}
                  onClick={() => setMostrarMotivos(!mostrarMotivos)}
                >
                  Pedir reenvio
                </button>
                <button className="rvp-botao rvp-botao--primario" type="button" onClick={enviarSolicitacao}>
                  Revisar e enviar ao autorizador
                </button>
              </div>
            </div>
          </div>
        )}

        {verHistorico && id && (
          <ModalHistorico sol_id={Number(id)} perfil="ADMIN" titulo={`Histórico da prescrição nº ${id}`} onClose={() => setVerHistorico(false)} />
        )}
      </main>
    </div>
  );
}


export default EnviarPrescricao;
