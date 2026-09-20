import {
    useEffect,
    useState,
    type FormEvent,
    type ChangeEvent
} from 'react';

import { Upload } from 'lucide-react';
import { SendHorizontal } from 'lucide-react';
import { Info } from 'lucide-react';

import Sidebar from '../components/universais/Sidebar.tsx';
import api from '../services/SoliciatcaoService';
import Header from '../components/universais/Header';
import Footer from '../components/universais/Footer.tsx';

import '../css/home/EnviarSolicitacao.css';
import Swal from 'sweetalert2';




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

function fileToBase64(file: File): Promise<string> {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onloadend = () => {

            const result = reader.result;

            if (typeof result !== 'string') {

                reject(
                    new Error(
                        'Falha ao converter arquivo.'
                    )
                );

                return;
            }

            // Remove "data:image/...;base64,"
            resolve(
                result.split(',')[1]
            );
        };

        reader.onerror = () => {

            reject(
                new Error(
                    'Falha ao ler arquivo.'
                )
            );

        };

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

    const [, setMessage] =
        useState('');

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

    function selecionarArquivo(
        e: ChangeEvent<HTMLInputElement>
    ) {
        if (
            e.target.files &&
            e.target.files.length > 0
        ) {
            const arquivo = e.target.files[0];

            const tamanhoMaximo =
                5 * 1024 * 1024;

            if (arquivo.size > tamanhoMaximo) {

                setMessage(
                    'A prescrição deve ter no máximo 5 MB.'
                );

                e.target.value = '';

                return;
            }

            setFile(arquivo);

            setMessage('');
        }
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

            Swal.fire({
                icon: 'error',
                title: 'Erro ao enviar prescrição!',
                text: 'Não foi possível enviar a prescrição.',
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
    <>
        <Header onMenuClick={toggleSidebar} />

        <Sidebar
            isOpen={sidebarOpen}
            onClose={toggleSidebar}
        />

        <main className="solicitacao-page">

            <div className="solicitacao-card">

                {/* CABEÇALHO */}

                <div className="solicitacao-header">

                    <h1>Enviar Prescrição</h1>

                    <p>
                        Envie uma foto da sua prescrição para que possamos
                        analisar e cadastrar seus insumos.
                    </p>

                </div>


                {/* INFORMAÇÃO */}

                <div className="info-prescricao">

                    <div className="info-icone">
                        <Info size={21} strokeWidth={3} />
                    </div>

                    <div className="info-conteudo">

                        <h3>
                            Por que enviar sua prescrição?
                        </h3>

                        <p>
                            A prescrição é o documento que contém os insumos
                            necessários para o seu tratamento. Com ela,
                            conseguimos preparar seus materiais e informar
                            quando estarão disponíveis para retirada.
                        </p>

                    </div>

                </div>


                <form
                    className="solicitacao-form"
                    onSubmit={handleSubmit}
                >

                    {/* CARDS */}

                    <div className="formulario-grid">

                        {/* ================================
                            UPLOAD
                        ================================= */}

                        <div className="campo-card prescricao-card">

                            <div className="prescricao-titulo">

                                <h2>
                                    Envie a foto da sua prescrição
                                </h2>

                                <p>
                                    A imagem deve estar nítida e legível
                                </p>

                            </div>


                            <div className="arquivo-area">

                                <div className="upload-icon">
                                    <Upload
                                        size={38}
                                        strokeWidth={2.0}
                                    />
                                </div>


                                <input
                                    id="prescricao"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={selecionarArquivo}
                                    required
                                    className="input-arquivo"
                                />


                                <span className="upload-texto">

                                    {file
                                        ? file.name
                                        : "Arraste e solte uma imagem aqui"}

                                </span>


                                <span className="upload-ou">
                                    ou
                                </span>


                                <label
                                    htmlFor="prescricao"
                                    className="btn-selecionar"
                                >
                                    Selecionar imagem
                                </label>


                                <small className="formatos">
                                    Formatos aceitos: JPG, PNG ou PDF
                                    <br />
                                    Tamanho máximo: 5MB
                                </small>

                            </div>

                        </div>


                        {/* ================================
                            INFORMAÇÕES
                        ================================= */}

                        <div className="campo-card informacoes-card">

                            <div className="informacoes-titulo">

                                <h2>
                                    Informações da prescrição
                                </h2>

                            </div>


                            <div className="campos-container">

                                <div className="campo">

                                    <label htmlFor="posto">
                                        Unidade de Saúde
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


                                <div className="campo">

                                    <label htmlFor="observacao">
                                        Observação
                                        <span> (opcional)</span>
                                    </label>

                                    <textarea
                                        id="observacao"
                                        value={observacao}
                                        onChange={e =>
                                            setObservacao(e.target.value)
                                        }
                                        placeholder="Digite alguma informação adicional, caso necessário..."
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* PARTE INFERIOR */}

                    <div className="formulario-footer">

                        <div className="dados-protegidos">

                            <div className="protegidos-icone">
                                <span>✓</span>
                            </div>

                            <div>

                                <strong>
                                    Seus dados estão protegidos
                                </strong>

                                <p>
                                    Suas informações são confidenciais e
                                    utilizadas apenas para o gerenciamento
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
                            />

                            <span>
                                {enviando
                                    ? "Enviando..."
                                    : "Enviar"}
                            </span>

                        </button>

                    </div>

                </form>

            </div>

        </main>

        <Footer />
    </>
);
}

export default EnviarSolicitaçao;