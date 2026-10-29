import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import { CalendarOff, Clock, FileUp, MapPin, Navigation } from "lucide-react";
import Header from "../components/universais/Header";
import Sidebar from "../components/universais/Sidebar";
import Footer from "../components/universais/Footer";
import BotaoVoltar from "../components/universais/BotaoVoltar";
import ContatoUnidade from "../components/universais/ContatoUnidade";
import { useValidarToken } from "../hook/Validartoken";
import { buscarHorarios, type HorariosUnidade } from "../services/AgendaService";
import { DIAS_SEMANA, ROTULO_TURNO, TURNOS } from "../utils/agenda";
import { formatarData } from "../utils/status";
import { hojeISO, mensagemErroApi } from "../utils/validacoes";
import { API_URL } from "../config";
import iconpng from "../assets/home-log/ubs.webp";

interface PostoDetalhe {
  pos_id: number;
  pos_nome: string;
  pos_endereco: string | null;
  pos_latitude: number | null;
  pos_longitude: number | null;
  pos_whatsapp?: string | null;
}

const iconPosto = L.icon({ iconUrl: iconpng, iconSize: [50, 50], iconAnchor: [21, 42] });
// segunda primeiro, domingo no fim
const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0];

const agoraHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Detalhes do ponto de coleta: endereço, como chegar, contato e horário de
 * entrega de insumos por dia (o mesmo da página "Horários da unidade"),
 * com os próximos dias em que a unidade estará fechada.
 */
export default function PontoColetaDetalhe() {
  const { verificando } = useValidarToken("PACIENTE");
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posto, setPosto] = useState<PostoDetalhe | null>(null);
  const [agenda, setAgenda] = useState<HorariosUnidade | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (verificando) return;
    let ativo = true;
    const pos_id = Number(id);
    Promise.all([axios.get<PostoDetalhe>(`${API_URL}/postos/${pos_id}`), buscarHorarios(pos_id)])
      .then(([p, h]) => {
        if (!ativo) return;
        setPosto(p.data);
        setAgenda(h);
      })
      .catch((e) => ativo && setErro(mensagemErroApi(e, "Não foi possível carregar este ponto de coleta.")));
    return () => {
      ativo = false;
    };
  }, [id, verificando]);

  // situação de agora: aberto (em qual turno) ou fechado
  const situacaoAgora = useMemo(() => {
    if (!agenda) return null;
    const hoje = hojeISO();
    const fechado = agenda.bloqueios.find((b) => b.data === hoje);
    if (fechado) return { aberto: false, texto: `Fechado hoje${fechado.motivo ? ` (${fechado.motivo})` : ""}` };
    const semana = new Date().getDay();
    const agora = agoraHHMM();
    const turno = agenda.horarios.find((h) => h.dia_semana === semana && h.abre <= agora && agora < h.fecha);
    if (turno) return { aberto: true, texto: `Aberto agora · entrega até ${turno.fecha}` };
    const depois = agenda.horarios
      .filter((h) => h.dia_semana === semana && h.abre > agora)
      .sort((a, b) => a.abre.localeCompare(b.abre))[0];
    return { aberto: false, texto: depois ? `Fechado agora · abre às ${depois.abre}` : "Fechado agora" };
  }, [agenda]);

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  const temMapa = posto?.pos_latitude != null && posto?.pos_longitude != null;
  const destino = temMapa
    ? `${posto!.pos_latitude},${posto!.pos_longitude}`
    : encodeURIComponent(`${posto?.pos_nome ?? ""}, ${posto?.pos_endereco ?? ""}`);
  const rota = `https://www.google.com/maps/dir/?api=1&destination=${destino}`;

  return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
      <Header onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="barra-voltar barra-voltar--logado">
        <BotaoVoltar para="/pontos-coleta" />
      </div>

      <main className="pagina-conteudo mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {erro && <p className="rounded-2xl bg-white p-6 text-center text-rose-600 shadow-sm" role="alert">{erro}</p>}
        {!erro && !posto && <p className="py-10 text-center text-gray-400" role="status">Carregando…</p>}

        {posto && (
          <>
            <header className="mb-5">
              <p className="text-sm font-medium text-blue-700">Ponto de coleta</p>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{posto.pos_nome}</h1>
              {situacaoAgora && (
                <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  situacaoAgora.aberto ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-700"
                }`}>
                  {situacaoAgora.texto}
                </p>
              )}
            </header>

            {/* Endereço, mapa e contato */}
            <section className="overflow-hidden rounded-3xl bg-white shadow-sm" aria-labelledby="titulo-endereco">
              {temMapa && (
                <div className="h-56 w-full sm:h-64" aria-hidden="true">
                  <MapContainer
                    center={[posto.pos_latitude!, posto.pos_longitude!]}
                    zoom={16}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                    <Marker position={[posto.pos_latitude!, posto.pos_longitude!]} icon={iconPosto} />
                  </MapContainer>
                </div>
              )}
              <div className="p-5">
                <h2 id="titulo-endereco" className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <MapPin aria-hidden="true" className="h-5 w-5 text-blue-700" /> Endereço
                </h2>
                <p className="mt-1 text-gray-700">{posto.pos_endereco ?? "Endereço não cadastrado"}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <a
                    href={rota}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    <Navigation aria-hidden="true" className="h-4 w-4" /> Como chegar
                  </a>
                  {/* atalho: abre o envio de prescrição já com esta unidade escolhida */}
                  <Link
                    to={`/enviarsolicitacao?posto=${posto.pos_id}`}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-blue-700 px-5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    <FileUp aria-hidden="true" className="h-4 w-4" /> Enviar prescrição
                  </Link>
                  <ContatoUnidade
                    pos_nome={posto.pos_nome}
                    pos_whatsapp={posto.pos_whatsapp}
                    mensagem={`Olá! Tenho uma dúvida sobre a retirada de insumos na ${posto.pos_nome}.`}
                  />
                </div>
              </div>
            </section>

            {/* Horário de entrega de insumos */}
            {agenda && (
              <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm" aria-labelledby="titulo-horario">
                <h2 id="titulo-horario" className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <Clock aria-hidden="true" className="h-5 w-5 text-blue-700" /> Horário de entrega de insumos
                </h2>
                <p className="mt-1 text-sm text-gray-500">A retirada é feita no dia e turno do seu agendamento.</p>
                <dl className="mt-3 divide-y divide-gray-100">
                  {ORDEM_DIAS.map((dia) => {
                    const turnos = TURNOS.map((t) => agenda.horarios.find((h) => h.dia_semana === dia && h.turno === t)).filter(Boolean);
                    const hoje = new Date().getDay() === dia;
                    return (
                      <div key={dia} className={`flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5 ${hoje ? "font-semibold" : ""}`}>
                        <dt className="text-gray-800">
                          {DIAS_SEMANA[dia]}
                          {hoje && <span className="ml-2 text-xs font-semibold text-blue-700">hoje</span>}
                        </dt>
                        <dd className="text-gray-700">
                          {turnos.length
                            ? turnos.map((h) => `${ROTULO_TURNO[h!.turno]} ${h!.abre}–${h!.fecha}`).join(" · ")
                            : <span className="text-gray-400">Não atende</span>}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                {agenda.bloqueios.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
                    <p className="flex items-center gap-2 font-semibold">
                      <CalendarOff aria-hidden="true" className="h-4 w-4" /> Dias em que a unidade estará fechada
                    </p>
                    <ul className="mt-2 space-y-1">
                      {agenda.bloqueios.slice(0, 6).map((b) => (
                        <li key={b.id}>
                          {formatarData(b.data)}
                          {b.motivo ? ` · ${b.motivo}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
