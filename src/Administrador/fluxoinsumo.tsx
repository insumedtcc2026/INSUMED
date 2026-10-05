import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import { useEffect, useRef, useState } from "react";
import { useValidarToken } from '../hook/Validartoken.tsx';
import { useDadosInsumos } from "../hook/Insumosposto";
import Swal from "sweetalert2";
import axios from "axios";
import "../css/home/FluxoInsumos.css";

const LIMITE = 15;          
const ITENS_POR_PAGINA = 9; 

export default function FluxoInsumo() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [marca, setMarca] = useState("");
  const [nome, setNome] = useState("");
  const [quant, setQuant] = useState("");

  // Modal de movimentação
  const [modalAberto, setModalAberto] = useState(false);
  const [insumoMovId, setInsumoMovId] = useState("");
  const [tipoMov, setTipoMov] = useState<"entrada" | "saida">("entrada");
  const [quantMov, setQuantMov] = useState("");
  const [enviando, setEnviando] = useState(false); 


  const [pagina, setPagina] = useState(1);

  const headerRef = useRef<HTMLDivElement>(null);
  const [alturaHeader, setAlturaHeader] = useState(101);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const { verificando } = useValidarToken();
  const { insumos, carregarInsumos, movimentarInsumo } = useDadosInsumos();
  const carregando = verificando || insumos === null;

  useEffect(() => {
    if (carregando) return; 

    const caixa = headerRef.current;
    const header = caixa?.querySelector("header") ?? caixa?.firstElementChild;
    if (!(header instanceof HTMLElement)) return;

    const medir = () => {
      if (header.offsetHeight > 0) setAlturaHeader(header.offsetHeight);
    };
    medir();
    window.addEventListener("resize", medir); // mede de novo se a tela mudar de tamanho
    return () => window.removeEventListener("resize", medir);
  }, [carregando]);

  useEffect(() => {
    if (!modalAberto) return;

    const aoApertarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !Swal.isVisible()) setModalAberto(false);
    };
    document.addEventListener("keydown", aoApertarTecla);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoApertarTecla);
      document.body.style.overflow = "";
    };
  }, [modalAberto]);

  const limparFormulario = () => {
    setMarca("");
    setNome("");
    setQuant("");
  };

  const abrirModal = () => {
    setInsumoMovId("");
    setTipoMov("entrada");
    setQuantMov("");
    setModalAberto(true);
  };

  const fecharModal = () => setModalAberto(false);

  async function cadastrarInsumo(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const resposta = await axios.post(
        "https://backend-insumed-lhac.vercel.app/insumos",
        {
          nome: nome,
          marca: marca,
          quantidade: parseInt(quant),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      carregarInsumos();
      console.log(resposta.data);
      Swal.fire({
        icon: 'success',
        title: 'Insumo cadastrado!',
        text: 'O insumo foi cadastrado com êxito.',
        confirmButtonColor: '#3085d6',
      });
      limparFormulario();
    } catch (error) {
      console.error("Erro ao cadastrar insumo:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erro no cadastro!',
        text: 'Ocorreu um erro ao cadastrar o insumo.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Tentar Novamente'
      });
    }
  }

  async function confirmarMovimentacao(e: React.FormEvent) {
    e.preventDefault();
    if (!insumoMovId || enviando) return; 

    setEnviando(true);
    try {
      const data = await movimentarInsumo(Number(insumoMovId), tipoMov, Number(quantMov));
      fecharModal();
      Swal.fire({ icon: "success", title: "Movimentação registrada!", text: data.message });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro na movimentação",
        text: error instanceof Error ? error.message : "Erro inesperado",
      });
    } finally {
      setEnviando(false); // roda dando certo ou errado
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  if (insumos === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando insumos...</p>
      </div>
    );
  }

  const totalInsumos = insumos.length;
  const insumosAcabando = insumos.filter((insumo) => insumo.ins_quantidade <= LIMITE);

  // Paginação feita no front
  const totalPaginas = Math.max(1, Math.ceil(insumos.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const insumosDaPagina = insumos.slice(inicio, inicio + ITENS_POR_PAGINA);


  const insumoSelecionado = insumos.find((i) => i.ins_id === Number(insumoMovId));
  const estoqueAtual = Number(insumoSelecionado?.ins_quantidade ?? 0);
const qtdDigitada = Number(quantMov) || 0;
const estoqueDepois = tipoMov === "entrada" ? estoqueAtual + qtdDigitada : estoqueAtual - qtdDigitada;
const estoqueInsuficiente = insumoSelecionado !== undefined && estoqueDepois < 0;

  return (
    <div className="ins-pagina">
      <Sidebaradm isOpen={sidebarOpen} onClose={toggleSidebar} />
      <div ref={headerRef}>
        <HeaderAdm onMenuClick={toggleSidebar} />
      </div>

      <div style={{ height: alturaHeader }} aria-hidden="true" />

      <main className="ins-main">
        <h1 className="ins-titulo">Insumos</h1>

       
        <form className="ins-form-cadastro" onSubmit={cadastrarInsumo}>
          <div className="ins-campo ins-campo-nome">
            <label htmlFor="ins-nome" className="ins-escondido">Nome do insumo</label>
            <input
              id="ins-nome"
              className="ins-input"
              type="text"
              placeholder="Digite o nome do insumo"
              name="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="ins-campo ins-campo-marca">
            <label htmlFor="ins-marca" className="ins-escondido">Marca do insumo</label>
            <input
              id="ins-marca"
              className="ins-input"
              type="text"
              placeholder="Marca"
              name="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)} />
          </div>

          <div className="ins-campo ins-campo-quant">
            <label htmlFor="ins-quant" className="ins-escondido">Quantidade</label>
            <input
              id="ins-quant"
              className="ins-input"
              type="number"
              inputMode="numeric"
              placeholder="Quantidade"
              name="quant"
              required
              min="0"
              value={quant}
              onChange={(e) => setQuant(e.target.value)} />
          </div>

          <button type="submit" className="ins-btn ins-btn-primario ins-btn-cadastrar">
            cadastrar
          </button>
        </form>


        <section className="ins-painel">
          <div className="ins-topo">
            <div className="ins-cards">
              <div className="ins-card">
                <div>
                  <p className="ins-card-rotulo">Total de Insumos</p>
                  <p className="ins-card-valor">{totalInsumos}</p>
                </div>
                <span className="ins-card-icone ins-icone-azul">
                  {/* Ícone de caminhão */}
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 5h11v10H3zM14 8h4l3 4v3h-7zM6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  </svg>
                </span>
              </div>

              <div className="ins-card">
                <div>
                  <p className="ins-card-rotulo">Insumos Acabando</p>
                  <p className="ins-card-valor">{insumosAcabando.length}</p>
                </div>
                <span className="ins-card-icone ins-icone-laranja">
                  {/* Ícone de alerta */}
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2 1 21h22L12 2zm1 15h-2v2h2v-2zm0-7h-2v5h2v-5z" />
                  </svg>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="ins-btn ins-btn-primario ins-btn-movimentar"
              onClick={abrirModal}
              disabled={insumos.length === 0}
            >
              Fazer Movimentação
            </button>
          </div>

          {insumos.length === 0 ? (
            <p className="ins-vazio">Esse posto não tem insumos.</p>
          ) : (
            <div className="ins-tabela-wrapper">
              <table className="ins-tabela">
                <thead>
                  <tr>
                    <th>Marca</th>
                    <th>Nome do Insumo</th>
                    <th>Posto de Saúde</th>
                    <th>Quantidade</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {insumosDaPagina.map((insumo) => (
                    <tr key={insumo.ins_id}>
                      
                      <td data-label="Marca">
                        <div className="ins-marca">
                          <span className="ins-marca-icone">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 3 3 10v11h6v-6h6v6h6V10z" />
                            </svg>
                          </span>
                          <span className="ins-marca-nome">{insumo.ins_marca || "Sem marca"}</span>
                        </div>
                      </td>
                      <td data-label="Nome do insumo">{insumo.ins_nome}</td>
                      <td data-label="Posto de saúde">{insumo.posto_nome || "Sem posto"}</td>
                      <td data-label="Quantidade">{insumo.ins_quantidade}</td>
                      <td data-label="ID">{insumo.ins_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPaginas > 1 && (
                <div className="ins-paginacao">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                    <button
                      key={numero}
                      type="button"
                      className={numero === paginaAtual ? "ins-pagina-ativa" : ""}
                      onClick={() => setPagina(numero)}
                    >
                      {numero}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ===== Modal de movimentação ===== */}
      {modalAberto && (
        <div
          className="ins-modal-fundo"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) fecharModal(); 
          }}
        >
          <form
            className="ins-modal"
            onSubmit={confirmarMovimentacao}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ins-modal-titulo"
          >
            <div className="ins-modal-cabecalho">
              <span className="ins-modal-icone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 4v16M7 4 3 8M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4" />
                </svg>
              </span>
              <div className="ins-modal-textos">
                <h2 id="ins-modal-titulo" className="ins-modal-titulo">Fazer Movimentação</h2>
                <p className="ins-modal-subtitulo">Registre a entrada ou a saída de um insumo do estoque.</p>
              </div>
              <button type="button" className="ins-modal-fechar" onClick={fecharModal} aria-label="Fechar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="ins-modal-corpo">
              <div className="ins-campo">
                <label htmlFor="ins-mov-insumo" className="ins-label">Insumo</label>
                <select
                  id="ins-mov-insumo"
                  className="ins-input ins-select"
                  required
                  autoFocus
                  value={insumoMovId}
                  onChange={(e) => setInsumoMovId(e.target.value)}
                >
                  <option value="">Selecione o insumo</option>
                  {insumos.map((insumo) => (
                    <option key={insumo.ins_id} value={insumo.ins_id}>
                      {insumo.ins_nome}{insumo.ins_marca ? ` - ${insumo.ins_marca}` : ""} (ID {insumo.ins_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="ins-campo">
                <span className="ins-label">Tipo de movimentação</span>
                <div className="ins-tipos">
                  <button
                    type="button"
                    className={`ins-tipo ins-tipo-entrada ${tipoMov === "entrada" ? "ins-tipo-ativo" : ""}`}
                    aria-pressed={tipoMov === "entrada"}
                    onClick={() => setTipoMov("entrada")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Entrada
                  </button>
                  <button
                    type="button"
                    className={`ins-tipo ins-tipo-saida ${tipoMov === "saida" ? "ins-tipo-ativo" : ""}`}
                    aria-pressed={tipoMov === "saida"}
                    onClick={() => setTipoMov("saida")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M5 12h14" />
                    </svg>
                    Saída
                  </button>
                </div>
              </div>

              <div className="ins-campo">
                <label htmlFor="ins-mov-quant" className="ins-label">Quantidade</label>
                <input
                  id="ins-mov-quant"
                  className="ins-input"
                  type="number"
                  inputMode="numeric"
                  placeholder="Digite a quantidade"
                  value={quantMov}
                  required
                  min="1"
                  onChange={(e) => setQuantMov(e.target.value)}
                />
              </div>

              {insumoSelecionado && (
                <div className="ins-resumo">
                  <div className="ins-resumo-linha">
                    <span>Estoque atual</span>
                    <strong>{estoqueAtual}</strong>
                  </div>
                  {quantMov !== "" && (
                    <div className={`ins-resumo-linha ${estoqueInsuficiente ? "ins-resumo-erro" : ""}`}>
                      <span>{estoqueInsuficiente ? "Estoque insuficiente" : "Estoque depois"}</span>
                      <strong>{estoqueInsuficiente ? `máx. ${estoqueAtual}` : estoqueDepois}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ins-modal-rodape">
              <button type="button" className="ins-btn ins-btn-secundario" onClick={fecharModal}>
                Cancelar
              </button>
              <button
                type="submit"
                className="ins-btn ins-btn-primario"
                disabled={enviando || estoqueInsuficiente}
              >
                {enviando ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
