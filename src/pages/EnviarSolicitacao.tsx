import {
    useEffect,
    useState,
    type FormEvent
} from 'react';

import api from '../services/SoliciatcaoService';

import '../css/home/EnviarSolicitacao.css';





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
    e: React.ChangeEvent<HTMLInputElement>
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
            console.log(
    "TOKEN:",
    localStorage.getItem("token")
);
            const response =
                await api.post(
                    '/solicitacoes',
                    {

                        pos_id:
                            Number(posto),

                        sol_prescricao:
                            base64String,

                        sol_observacao:
                            observacao

                    }
                );


            if (
                response.status === 200 ||
                response.status === 201
            ) {

                setMessage(
                    'Solicitação enviada com sucesso!'
                );

                // Limpa formulário

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

            console.error(
                'Erro ao enviar solicitação:',
                error
            );

            setMessage(
                'Não foi possível enviar a solicitação.'
            );

        } finally {

            setEnviando(false);

        }
    }


    // ==============================
    // HTML
    // ==============================

    return (

       <div className="solicitacao-page">

    <div className="solicitacao-card">

        <div className="solicitacao-header">
            <h1>Enviar Prescrição</h1>

            <p>
                Envie sua prescrição para solicitar os insumos necessários.
            </p>
        </div>

        <form
            className="solicitacao-form"
            onSubmit={handleSubmit}
        >

            <div className="formulario-grid">

               {/* PRESCRIÇÃO */}
<div className="campo-card prescricao-card">

    <div className="prescricao-titulo">
        Envie a foto da sua prescrição
    </div>

    <div className="prescricao-subtitulo">
        A imagem deve estar nítida e legível
    </div>

    <div className="arquivo-area">

        {/* ÍCONE DE UPLOAD */}
        <div className="upload-icon">
            <span>⇧</span>
        </div>

        {/* INPUT ESCONDIDO */}
        <input
            id="prescricao"
            type="file"
            accept="image/*,.pdf"
            onChange={selecionarArquivo}
            required
            className="input-arquivo"
        />

        {/* TEXTO */}
        <span className="upload-texto">
            {file
                ? file.name
                : "Arraste e solte uma imagem aqui"}
        </span>

        {/* OU */}
        <span className="upload-ou">
            ou
        </span>

        {/* BOTÃO */}
        <label
            htmlFor="prescricao"
            className="btn-selecionar"
        >
            Selecionar imagem
        </label>

        {/* FORMATOS */}
        <small className="formatos">
            Formatos aceitos: JPG, PNG ou PDF
            <br />
            Tamanho máximo: 10MB
        </small>

    </div>

</div>


                {/* INFORMAÇÕES */}
                <div className="campo-card">

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
                                Selecione uma
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
                        </label>

                        <textarea
                            id="observacao"
                            value={observacao}
                            onChange={e =>
                                setObservacao(e.target.value)
                            }
                            placeholder="Digite alguma informação adicional..."
                        />

                    </div>

                </div>

            </div>

            <button
                className="btn-enviar"
                type="submit"
                disabled={enviando}
            >
                {enviando
                    ? "Enviando..."
                    : "Enviar solicitação"}
            </button>

        </form>

    </div>

</div>
    );
}


export default EnviarSolicitaçao;