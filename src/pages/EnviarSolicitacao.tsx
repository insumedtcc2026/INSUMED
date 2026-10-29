import {
    useEffect,
    useState,
    type FormEvent,
    type ChangeEvent,
    type DragEvent
} from 'react';

import { Upload } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';
import { Info } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import Sidebar from '../components/universais/Sidebar.tsx';
import api from '../services/SoliciatcaoService';
import Header from '../components/universais/Header';
import Footer from '../components/universais/Footer.tsx';
import BotaoVoltar from '../components/universais/BotaoVoltar';

import '../css/home/EnviarSolicitacao.css';
import Swal from 'sweetalert2';
import { mensagemErroApi } from '../utils/validacoes';
import { arquivoParaBase64, erroArquivoPrescricao } from '../components/usuario-1/prescricao/arquivoPrescricao';
import { buscarPostoSugeridoDoPaciente } from '../utils/postoSugerido';
import CampoBusca from '../components/universais/CampoBusca';




// ==============================
// INTERFACE DO POSTO
// ==============================

interface Posto {
    pos_id: number;
    pos_nome: string;
}


// ==============================
// COMPONENTE
// ==============================

function EnviarSolicitaçao() {

    // Estado do sidebar precisa estar DENTRO do componente
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    const [postos, setPostos] =
        useState<Posto[]>([]);

    const [posto, setPosto] =
        useState('');

    const [file, setFile] =
        useState<File | null>(null);

    const [observacao, setObservacao] =
        useState('');

    // mensagem de erro/andamento mostrada no formulário
    // (antes era gravada mas nunca aparecia na tela)
    const [message, setMessage] =
        useState('');

    // arquivo sendo arrastado sobre a área de envio
    const [arrastando, setArrastando] =
        useState(false);

    const [enviando, setEnviando] =
        useState(false);

    // unidade sugerida: a que veio do atalho "Enviar prescrição" de um ponto
    // de coleta (?posto=) ou a que o paciente mais usou nas últimas coletas
    const [searchParams] = useSearchParams();
    const postoDoLink = Number(searchParams.get('posto')) || null;
    const [sugerido, setSugerido] =
        useState<{ pos_id: number; origem: 'link' | 'historico' } | null>(null);


    // ==============================
    // BUSCAR POSTOS
    // ==============================

    useEffect(() => {

        async function carregarPostos() {

            try {

                const response =
                    await api.get('/postos');

                setPostos(response.data);

            } catch (error) {

                console.error(
                    'Erro ao buscar postos:',
                    error
                );

                setMessage(
                    'Não foi possível carregar as unidades de saúde.'
                );
            }
        }

        carregarPostos();

    }, []);


    // ==============================
    // SUGERIR UNIDADE
    // ==============================

    useEffect(() => {
        if (!postos.length) return;
        let ativo = true;

        const aplicar = (pos_id: number | null, origem: 'link' | 'historico') => {
            if (!ativo || !pos_id || !postos.some((p) => p.pos_id === pos_id)) return false;
            setSugerido({ pos_id, origem });
            // só preenche se a pessoa ainda não escolheu nada
            setPosto((atual) => atual || String(pos_id));
            return true;
        };

        if (!aplicar(postoDoLink, 'link')) {
            buscarPostoSugeridoDoPaciente()
                .then((pos_id) => aplicar(pos_id, 'historico'))
                .catch(() => undefined);
        }

        return () => { ativo = false; };
    }, [postos, postoDoLink]);


    // ==============================
    // SELECIONAR IMAGEM
    // ==============================

    // Mesmas regras para o arquivo escolhido no botão ou arrastado:
    // imagem ou PDF, até 5 MB (o backend confere de novo).
    function aceitarArquivo(arquivo: File): boolean {

        const erro = erroArquivoPrescricao(arquivo);
        if (erro) {
            setMessage(erro);
            return false;
        }

        setFile(arquivo);
        setMessage('');
        return true;
    }

    function selecionarArquivo(
        e: ChangeEvent<HTMLInputElement>
    ) {
        if (
            e.target.files &&
            e.target.files.length > 0
        ) {
            if (!aceitarArquivo(e.target.files[0])) {
                e.target.value = '';
            }
        }
    }

    function soltarArquivo(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setArrastando(false);
        const arquivo = e.dataTransfer.files?.[0];
        if (arquivo) aceitarArquivo(arquivo);
    }


    // ==============================
    // ENVIAR SOLICITAÇÃO
    // ==============================

    async function handleSubmit(
        e: FormEvent
    ) {

        e.preventDefault();

        setMessage('');


        // Verifica posto

        if (!posto) {

            setMessage(
                'Selecione uma unidade de saúde.'
            );

            return;
        }


        // Verifica arquivo

        if (!file) {

            setMessage(
                'Selecione a prescrição.'
            );

            return;
        }


        try {

            setEnviando(true);

            setMessage(
                'Enviando solicitação...'
            );


            // Converte imagem

            const base64String =
                await arquivoParaBase64(file);


            // Envia para o backend

            const response =
                await api.post(
                    '/solicitacoes',
                    {

                        pos_id:
                            Number(posto),

                        sol_prescricao:
                            base64String,

                        sol_observacao:
                            observacao,

                        // NOVO: manda o mimetype real do arquivo (ex: "image/png",
                        // "application/pdf") pro backend saber o que foi enviado.
                        sol_prescricao_tipo:
                            file.type

                    }
                );


            if (
                response.status === 200 ||
                response.status === 201
            ) {

                Swal.fire({
                    icon: 'success',
                    title: 'Prescrição Enviada com sucesso!',
                    text: 'Sua prescrição foi enviada com êxito.',
                    confirmButtonColor: '#00ce11',
                });

                setMessage('');

                // Limpa formulário (só quando dá certo)

                // volta para a unidade sugerida (a pessoa pode trocar)
                setPosto(sugerido ? String(sugerido.pos_id) : '');

                setFile(null);

                setObservacao('');

                // Limpa o input de arquivo

                const input =
                    document.getElementById(
                        'prescricao'
                    ) as HTMLInputElement;

                if (input) {
                    input.value = '';
                }
            }


        } catch (error) {

            // mostra o motivo vindo do backend (ex.: prescrição já enviada,
            // arquivo acima de 5 MB) em vez de uma mensagem genérica
            Swal.fire({
                icon: 'error',
                title: 'Erro ao enviar prescrição!',
                text: mensagemErroApi(error, 'Não foi possível enviar a prescrição.'),
                confirmButtonColor: '#dc3545',
            });

            setMessage('');

        } finally {

            setEnviando(false);

        }
    }


    // ==============================
    // HTML
    // ==============================
return (
    <div className="pagina-paciente min-h-screen bg-gray-50">
        <Header onMenuClick={toggleSidebar} />

        <Sidebar
            isOpen={sidebarOpen}
            onClose={toggleSidebar}
        />

        <div className="barra-voltar barra-voltar--logado">
            <BotaoVoltar para="/home" />
        </div>

        <main className="solicitacao-page">

            <div className="solicitacao-card">

                {/* CABEÇALHO (mesmo padrão das outras páginas do paciente) */}

                <header className="solicitacao-header">

                    <h1>Enviar prescrição</h1>

                    <p>
                        Envie uma foto ou PDF da sua prescrição para a unidade
                        analisar e separar seus insumos.
                    </p>

                </header>


                {/* INFORMAÇÃO */}

                <div className="info-prescricao">

                    <div className="info-icone" aria-hidden="true">
                        <Info size={18} strokeWidth={2.5} />
                    </div>

                    <div className="info-conteudo">

                        <h2>
                            Por que enviar sua prescrição?
                        </h2>

                        <p>
                            A prescrição é o documento que contém os insumos
                            necessários para o seu tratamento. Com ela,
                            conseguimos preparar seus materiais e avisar
                            quando estarão disponíveis para retirada.
                        </p>

                    </div>

                </div>


                <form
                    className="solicitacao-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <div className="formulario-grid">

                        {/* ================================
                            ARQUIVO
                        ================================= */}

                        <section className="envio-card envio-card-arquivo" aria-labelledby="titulo-arquivo">

                            <div className="envio-card-titulo">

                                <h2 id="titulo-arquivo">
                                    Foto ou PDF da prescrição
                                </h2>

                                <p>
                                    A imagem deve estar nítida e legível
                                </p>

                            </div>


                            <div
                                className={`arquivo-area ${arrastando ? 'arquivo-area--arrastando' : ''} ${file ? 'arquivo-area--com-arquivo' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
                                onDragLeave={() => setArrastando(false)}
                                onDrop={soltarArquivo}
                            >

                                <div className="upload-icon" aria-hidden="true">
                                    <Upload
                                        size={32}
                                        strokeWidth={2}
                                    />
                                </div>


                                <input
                                    id="prescricao"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={selecionarArquivo}
                                    className="input-arquivo"
                                />


                                <span className="upload-texto" aria-live="polite">

                                    {file
                                        ? file.name
                                        : "Arraste e solte o arquivo aqui"}

                                </span>


                                <span className="upload-ou">
                                    {file ? 'Quer trocar?' : 'ou'}
                                </span>


                                <label
                                    htmlFor="prescricao"
                                    className="btn-selecionar"
                                >
                                    {file ? 'Escolher outro arquivo' : 'Selecionar arquivo'}
                                </label>


                                <small className="formatos">
                                    Formatos aceitos: JPG, PNG ou PDF · até 5 MB
                                </small>

                            </div>

                        </section>


                        {/* ================================
                            INFORMAÇÕES
                        ================================= */}

                        <section className="envio-card envio-card-info" aria-labelledby="titulo-info">

                            <div className="envio-card-titulo">

                                <h2 id="titulo-info">
                                    Informações da prescrição
                                </h2>

                            </div>


                            <div className="campos-container">

                                <div className="envio-campo">

                                    <label htmlFor="posto">
                                        Unidade de saúde
                                    </label>

                                    {/* dá para digitar parte do nome ou só abrir a lista e escolher */}
                                    <CampoBusca
                                        id="posto"
                                        opcoes={postos.map((p) => ({
                                            valor: String(p.pos_id),
                                            rotulo: p.pos_nome,
                                            selo: sugerido?.pos_id === p.pos_id ? 'Sugerida' : undefined,
                                        }))}
                                        valor={posto}
                                        onEscolher={setPosto}
                                        placeholder="Busque ou escolha a unidade"
                                        semResultado="Nenhuma unidade com esse nome"
                                        descricao={sugerido ? 'posto-sugestao' : undefined}
                                    />

                                    {sugerido && (
                                        <p id="posto-sugestao" className="envio-sugestao">
                                            <Sparkles size={15} aria-hidden="true" />
                                            {sugerido.origem === 'link'
                                                ? 'Unidade do ponto de coleta que você estava vendo.'
                                                : 'Sugerimos a unidade que você mais usou nas últimas coletas.'}
                                            {' '}Você pode escolher outra.
                                        </p>
                                    )}

                                </div>


                                <div className="envio-campo">

                                    <label htmlFor="observacao">
                                        Observação
                                        <span> (opcional)</span>
                                    </label>

                                    <textarea
                                        id="observacao"
                                        value={observacao}
                                        maxLength={1000}
                                        onChange={e =>
                                            setObservacao(e.target.value)
                                        }
                                        placeholder="Alguma informação adicional para a unidade?"
                                    />

                                </div>

                            </div>

                        </section>

                    </div>


                    {message && (
                        <p
                            className={`envio-mensagem ${enviando ? 'envio-mensagem--andamento' : ''}`}
                            role={enviando ? 'status' : 'alert'}
                        >
                            {message}
                        </p>
                    )}


                    {/* PARTE INFERIOR */}

                    <div className="formulario-footer">

                        <div className="dados-protegidos">

                            <div className="protegidos-icone" aria-hidden="true">
                                <span>✓</span>
                            </div>

                            <div>

                                <strong>
                                    Seus dados estão protegidos
                                </strong>

                                <p>
                                    Suas informações são confidenciais e
                                    usadas apenas para o gerenciamento
                                    dos seus insumos.
                                </p>

                            </div>

                        </div>


                        <button
                            className="btn-enviar"
                            type="submit"
                            disabled={enviando}
                        >

                            <SendHorizontal
                                size={19}
                                strokeWidth={2.5}
                                aria-hidden="true"
                            />

                            <span>
                                {enviando
                                    ? "Enviando..."
                                    : "Enviar prescrição"}
                            </span>

                        </button>

                    </div>

                </form>

            </div>

        </main>

        <Footer />

    </div>
);
}

export default EnviarSolicitaçao;