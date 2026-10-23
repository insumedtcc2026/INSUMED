import { useCallback, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Camera, CameraOff, SwitchCamera } from "lucide-react";

interface Props {
  // chamado uma vez por leitura; a câmera pausa até o admin pedir outra
  onLeitura: (texto: string) => void;
  // enquanto a página consulta o backend, a câmera fica pausada
  ocupado?: boolean;
}

type CameraDisponivel = { id: string; label: string };

// Mensagens para os erros do getUserMedia (o navegador devolve em inglês)
function mensagemDoErro(erro: unknown): string {
  const nome = (erro as { name?: string })?.name ?? String(erro);
  if (/NotAllowed|Permission/i.test(nome))
    return "A permissão da câmera foi negada. Clique no cadeado ao lado do endereço do site, libere a câmera e tente de novo.";
  if (/NotFound|Overconstrained|Camera not found/i.test(nome))
    return "Nenhuma câmera foi encontrada neste aparelho. Use o leitor de QR Code ou digite o protocolo.";
  if (/NotReadable|TrackStart/i.test(nome))
    return "A câmera está sendo usada por outro programa. Feche-o e tente de novo.";
  if (!window.isSecureContext)
    return "O navegador só libera a câmera em sites com HTTPS.";
  return "Não foi possível abrir a câmera neste navegador. Use o leitor de QR Code ou digite o protocolo.";
}

/**
 * Câmera (webcam ou celular) lendo o QR Code do comprovante. Só liga
 * quando o admin clica, e desliga ao sair da página, ao trocar de aba e
 * depois de cada leitura. A biblioteca qr-scanner usa o leitor nativo do
 * navegador quando existe e, senão, decodifica num Web Worker.
 */
export default function LeitorCamera({ onLeitura, ocupado = false }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const scanner = useRef<QrScanner | null>(null);
  const aoLer = useRef(onLeitura);
  const [ligada, setLigada] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDisponivel[]>([]);
  const [cameraAtual, setCameraAtual] = useState(0);

  useEffect(() => {
    aoLer.current = onLeitura;
  }, [onLeitura]);

  const desligar = useCallback(() => {
    scanner.current?.stop();
    setLigada(false);
  }, []);

  const ligar = useCallback(async () => {
    if (!video.current) return;
    setErro(null);
    setAbrindo(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("sem suporte");
      if (!scanner.current) {
        scanner.current = new QrScanner(
          video.current,
          (resultado) => {
            // uma leitura por vez: para a câmera antes de avisar a página
            scanner.current?.stop();
            setLigada(false);
            navigator.vibrate?.(80);
            aoLer.current(resultado.data);
          },
          {
            returnDetailedScanResult: true,
            preferredCamera: "environment", // traseira, no celular
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 8,
          }
        );
      }
      await scanner.current.start();
      setLigada(true);
      // os nomes das câmeras só aparecem depois da permissão
      const lista = await QrScanner.listCameras(true).catch(() => []);
      setCameras(lista);
    } catch (e) {
      scanner.current?.stop();
      setLigada(false);
      setErro(mensagemDoErro(e));
    } finally {
      setAbrindo(false);
    }
  }, []);

  async function trocarCamera() {
    if (!scanner.current || cameras.length < 2) return;
    const proxima = (cameraAtual + 1) % cameras.length;
    try {
      await scanner.current.setCamera(cameras[proxima].id);
      setCameraAtual(proxima);
    } catch (e) {
      setErro(mensagemDoErro(e));
    }
  }

  // aba em segundo plano: a câmera não fica ligada à toa
  useEffect(() => {
    const aoMudarAba = () => document.hidden && desligar();
    document.addEventListener("visibilitychange", aoMudarAba);
    return () => document.removeEventListener("visibilitychange", aoMudarAba);
  }, [desligar]);

  // saiu da página: libera a câmera
  useEffect(() => () => {
    scanner.current?.destroy();
    scanner.current = null;
  }, []);

  return (
    <div className="leitor-camera">
      <div className={`leitor-camera-quadro ${ligada ? "leitor-camera-quadro--ligada" : ""}`}>
        <video ref={video} className="leitor-camera-video" muted playsInline aria-label="Imagem da câmera" />
        {!ligada && (
          <div className="leitor-camera-vazio">
            <Camera size={40} aria-hidden="true" />
            <p>{ocupado ? "Buscando o agendamento…" : "A câmera está desligada"}</p>
          </div>
        )}
      </div>

      {erro && (
        <p className="leitor-aviso leitor-aviso--erro" role="alert">
          {erro}
        </p>
      )}

      <div className="leitor-camera-acoes">
        {!ligada ? (
          <button type="button" className="leitor-botao" onClick={ligar} disabled={abrindo || ocupado}>
            <Camera size={18} aria-hidden="true" />
            {abrindo ? "Abrindo a câmera…" : "Usar câmera"}
          </button>
        ) : (
          <>
            <button type="button" className="leitor-botao leitor-botao--contorno" onClick={desligar}>
              <CameraOff size={18} aria-hidden="true" />
              Desligar câmera
            </button>
            {cameras.length > 1 && (
              <button type="button" className="leitor-botao leitor-botao--contorno" onClick={trocarCamera}>
                <SwitchCamera size={18} aria-hidden="true" />
                Trocar câmera
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
