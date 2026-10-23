import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, ScanLine } from "lucide-react";
import HeaderAdm from "../components/universais/HeaderAdm";
import Sidebaradm from "../components/universais/Siderbaradm";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import LeitorCamera from "../components/universais/LeitorCamera";
import { buscarPorQRCode } from "../services/AgendamentoService";
import { useValidarToken } from "../hook/Validartoken";
import { mensagemErroApi } from "../utils/validacoes";
import "../css/universais/LeitorQRCode.css";

/**
 * Leitor do QR Code do comprovante de agendamento. Três entradas na
 * mesma tela: leitor dedicado (USB/Bluetooth, que "digita" o conteúdo do
 * QR e aperta Enter no campo já focado), câmera (webcam ou celular) e o
 * protocolo digitado à mão. O backend identifica o agendamento e confere o
 * posto; daqui o admin vai direto para a tela de atendimento.
 */
export default function LeitorQRCode() {
  const { verificando } = useValidarToken("ADMIN");
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  // o campo já abre focado: o leitor USB pode ser usado sem clicar em nada
  useEffect(() => {
    if (!verificando) campo.current?.focus();
  }, [verificando]);

  async function identificar(lido: string) {
    const valor = lido.trim();
    if (!valor || buscando) return;
    setBuscando(true);
    setErro(null);
    try {
      const { sol_id } = await buscarPorQRCode(valor);
      navigate(`/leitor-qrcode/agendamento/${sol_id}`);
    } catch (e) {
      setErro(mensagemErroApi(e, "Não foi possível ler este QR Code."));
      setTexto("");
      setTimeout(() => campo.current?.focus(), 50);
    } finally {
      setBuscando(false);
    }
  }

  function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    identificar(texto);
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebaradm isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <HeaderAdm onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/homeadmin" />
      </div>

      <main id="conteudo" className="leitor-pagina">
        <header className="leitor-cabecalho">
          <span className="leitor-icone" aria-hidden="true">
            <QrCode size={26} />
          </span>
          <div>
            <h1>Ler QR Code</h1>
            <p>Leia o QR Code do comprovante do paciente para abrir o agendamento.</p>
          </div>
        </header>

        {erro && (
          <p className="leitor-aviso leitor-aviso--erro" role="alert">
            {erro}
          </p>
        )}

        <div className="leitor-grade">
          <section className="leitor-cartao" aria-labelledby="titulo-leitor-usb">
            <h2 id="titulo-leitor-usb">
              <ScanLine size={20} aria-hidden="true" /> Leitor de QR Code ou protocolo
            </h2>
            <p className="leitor-dica">
              Com o leitor conectado, basta apontar para o QR Code. Você também pode digitar o protocolo
              (ex.: AG000042) e apertar Enter.
            </p>
            <form onSubmit={aoEnviar} className="leitor-form">
              <input
                ref={campo}
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Aguardando leitura…"
                aria-label="Conteúdo do QR Code ou protocolo"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={120}
                className="leitor-campo"
                disabled={buscando}
              />
              <button type="submit" className="leitor-botao" disabled={buscando || !texto.trim()}>
                {buscando ? "Buscando…" : "Abrir"}
              </button>
            </form>
          </section>

          <section className="leitor-cartao" aria-labelledby="titulo-camera">
            <h2 id="titulo-camera">Câmera do computador ou do celular</h2>
            <LeitorCamera onLeitura={identificar} ocupado={buscando} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
