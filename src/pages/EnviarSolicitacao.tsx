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

import Sidebar from '../components/universais/Sidebar.tsx';
import api from '../services/SoliciatcaoService';
import Header from '../components/universais/Header';
import Footer from '../components/universais/Footer.tsx';
import BotaoVoltar from '../components/universais/BotaoVoltar';
import NavInferiorPaciente from '../components/universais/NavInferiorPaciente';

import '../css/home/EnviarSolicitacao.css';
import Swal from 'sweetalert2';
import { mensagemErroApi } from '../utils/validacoes';




// ==============================
// INTERFACE DO POSTO
// ==============================

interface Posto {
    pos_id: number;
    pos_nome: string;
}


// ==============================
// CONVERTER IMAGEM PARA BASE64
// ==============================
// Converte um arquivo selecionado pelo usuário para Base64.
function fileToBase64(file: File): Promise<string> {
  // Cria uma Promise para controlar a leitura assíncrona do arquivo.
    return new Promise((resolve, reject) => {
// FileReader permite ler o conteúdo de arquivos no navegador.
        const reader = new FileReader();
// Executado quando a leitura do arquivo é finalizada.
        reader.onloadend = () => {
         // Obtém o resultado da leitura.
            const result = reader.result;
          // Verifica se o resultado é uma string.
            if (typeof result !== 'string') {

                reject(
                    new Error(
                        'Falha ao converter arquivo.'
                    )
                );

                return;
            }
            // Remove o prefixo "data:image/...;base64,"
            // e retorna somente o conteúdo em Base64.
           
            resolve(
                result.split(',')[1]
            );
        };
         // Trata possíveis erros durante a leitura do arquivo.
        reader.onerror = () => {

            reject(
                new Error(
                    'Falha ao ler arquivo.'
                )
            );

        };
// Lê o arquivo e o transforma em uma Data URL.
        reader.readAsDataURL(file);
    });
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
    // SELECIONAR IMAGEM
    // ==============================

    // Mesmas regras para o arquivo escolhido no botão ou arrastado:
    // imagem ou PDF, até 5 MB (o backend confere de novo).
    function aceitarArquivo(arquivo: File): boolean {

        const tamanhoMaximo =
            5 * 1024 * 1024;

        const tipoValido =
            arquivo.type.startsWith('image/') ||
            arquivo.type === 'application/pdf';

        if (!tipoValido) {
            setMessage('Formato não suportado. Envie uma imagem (JPG, PNG) ou um PDF.');
            return false;
        }

        if (arquivo.size > tamanhoMaximo) {
            setMessage('A prescrição deve ter no máximo 5 MB.');
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
                await fileToBase64(file);


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

                setPosto('');

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

                                    <select
                                        id="posto"
                                        value={posto}
                                        onChange={e =>
                                            setPosto(e.target.value)
                                        }
                                        required
                                    >

                                        <option value="">
                                            Selecione uma unidade
                                        </option>

                                        {postos.map(posto => (

                                            <option
                                                key={posto.pos_id}
                                                value={posto.pos_id}
                                            >
                                                {posto.pos_nome}
                                            </option>

                                        ))}

                                    </select>

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

        <NavInferiorPaciente />
    </div>
);
}

export default EnviarSolicitaçao;