import { useState, useEffect, useMemo } from 'react';
import Header from '../components/universais/Header';
import Sidebar from '../components/universais/Sidebar';
import Footer from '../components/universais/Footer';
import '../css/home/perfil.css';
import { useDadosUser } from '../hook/Dadosuser.tsx';
import { useValidarToken } from '../hook/Validartoken.tsx';
import { usePrescricao } from '../hook/Pacienteprescriao.tsx';
import { useDetalhesPrescricao } from '../hook/Detalhesprescricao.tsx';
import Swal from 'sweetalert2';


function extensaoPorMimetype(mimetype: string | null | undefined): string {
  const mapa: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };

  if (!mimetype) return 'arquivo';

  return mapa[mimetype] || 'arquivo';
}

function gerarNomeArquivo(
  sol_data_solicitacao: string,
  sol_id: number,
  mimetype: string | null | undefined
): string {
  const data = new Date(sol_data_solicitacao);

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();

  const extensao = extensaoPorMimetype(mimetype);

  return `Prescrição_${dia}-${mes}-${ano}_#${sol_id}.${extensao}`;
}

// Converte a string base64 num Blob e devolve uma URL temporária (blob:...).
// Muito mais rápido e leve que usar "data:" URI direto num <a> ou <iframe>,
// porque o navegador nunca precisa tratar o arquivo inteiro como texto.
function base64ParaBlobUrl(base64: string, mimetype: string): string {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);

  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimetype });
  return URL.createObjectURL(blob);
}

export default function Perfil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const { verificando } = useValidarToken();
  const user = useDadosUser();
  const { prescricoes, carregando, erro } = usePrescricao();

  const {
    detalhes,
    carregandoDetalhes,
    erroDetalhes,
    abrirDetalhes,
    fecharDetalhes
  } = useDetalhesPrescricao();

  // Gera a Blob URL só quando "detalhes" muda, em vez de recriar
  // o Blob toda vez que o componente re-renderiza.
  const pdfBlobUrl = useMemo(() => {
    if (
      detalhes?.sol_prescricao_base64 &&
      detalhes.sol_prescricao_mimetype === 'application/pdf'
    ) {
      return base64ParaBlobUrl(
        detalhes.sol_prescricao_base64,
        detalhes.sol_prescricao_mimetype
      );
    }
    return null;
  }, [detalhes]);

  // Blob URLs ficam guardadas na memória do navegador até serem liberadas
  // manualmente. Sem isso, cada PDF aberto ficaria ocupando memória
  // pra sempre, mesmo depois do modal fechado.
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Antes esse Swal.fire rodava direto no corpo do componente,
  // disparando de novo a CADA re-render enquanto "erro" fosse verdadeiro
  // (ex: abrir/fechar sidebar, abrir/fechar modal, etc).
  // Com useEffect + [erro], ele só dispara quando o valor de "erro"
  // realmente muda de um render pro outro.
  useEffect(() => {
    if (erro) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: erro
      });
    }
  }, [erro]);

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  if (carregando) {
    return (
      <p className="text-xl text-gray-600">Carregando seus dados...</p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

      <Header onMenuClick={toggleSidebar} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="titulo-secao">Meu Perfil</h1>
      </main>

      <div className="perfil-container-form">
        <label>
          <p>Nome Completo</p>
          <input type="text" value={user.nome} />
        </label>

        <label>
          <p>CPF</p>
          <input type="text" value={user.cpf} />
        </label>

        <label>
          <p>CEP</p>
          <input type="text" value={user.cep} />
        </label>

        <label>
  <p>Data de Nascimento</p>
  <input 
    type="text" 
    value={
      user.data_nascimento 
        ? new Date(user.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
        : ''
    } 
  />
</label>

        <label>
          <p>Endereço de Email</p>
          <input type="text" value={user.email} />
        </label>

        <label>
          <p>Endereço</p>
          <input type="text" value={user.endereco} />
        </label>

        <label>
          <p>Telefone</p>
          <input type="text" value={user.telefone} />
        </label>

        <label>
          <p>Raça/Cor</p>
          <input type="text" value={user.raca} />
        </label>
      </div>

      <div className="prescrição-container">
        <main className="mx-auto max-w-7xl px-6 py-8">
          <h1 className="titulo-secao">Prescrições</h1>
        </main>

        {carregando ? (
          <p className="text-xl text-gray-600">Carregando prescrições...</p>
        ) : erro ? (
          <p className="text-xl text-gray-3200">Erro ao carregar prescrições.</p>
        ) : (
          <div className="prescricao-list">
            {prescricoes.length === 0 ? (
              <p className="text-xl text-gray-600">'{user.nome}' não tem prescrições.</p>
            ) : (
              prescricoes.map((prescricao) => {
                const statusClass = prescricao.sol_status.toLowerCase().replace(" ", "-");

                return (
                  <div className="prescricao-card" key={prescricao.sol_id}>
                    <p className="prescricao-data">
                      <strong>Data:</strong>{' '}
                      {new Date(prescricao.sol_data_solicitacao).toLocaleDateString('pt-BR')}
                    </p>

                    <div className="prescricao-arquivo">
                      {prescricao.tem_prescricao
                        ? gerarNomeArquivo(
                            prescricao.sol_data_solicitacao,
                            prescricao.sol_id,
                            prescricao.sol_prescricao_tipo
                          )
                        : 'Nenhum arquivo anexado'}
                    </div>

                    <div className="prescricao-acoes">
                      <span className={`status-badge status-${statusClass}`}>
                        {prescricao.sol_status}
                      </span>

                      <button
                        className="btn-ver-mais"
                        onClick={() => abrirDetalhes(prescricao.sol_id)}
                      >
                        Ver mais <span>&#8963;</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES DA PRESCRIÇÃO */}
      {detalhes && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <button className="modal-fechar" onClick={fecharDetalhes}>×</button>

            <h2>Solicitação #{detalhes.sol_id}</h2>
            <p><strong>Status:</strong> {detalhes.sol_status}</p>
            <p>
              <strong>Data:</strong>{' '}
              {new Date(detalhes.sol_data_solicitacao).toLocaleDateString('pt-BR')}
            </p>
            <p><strong>Observação:</strong> {detalhes.sol_observacao || 'Nenhuma observação.'}</p>

            {!detalhes.sol_prescricao_base64 ? (
              <p>Nenhum arquivo anexado.</p>
            ) : detalhes.sol_prescricao_mimetype === 'application/pdf' ? (
              // PDF: usamos a Blob URL (rápida, não trava o navegador),
              // em vez do "data:" URI anterior.
              pdfBlobUrl && (
                <>
                  <iframe
                    src={pdfBlobUrl}
                    className="modal-pdf"
                    title="Prescrição em PDF"
                  />
                  <a
                    href={pdfBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-abrir-pdf"
                  >
                    Abrir PDF em nova aba
                  </a>
                </>
              )
            ) : (
              <img
                src={`data:${detalhes.sol_prescricao_mimetype || 'image/png'};base64,${detalhes.sol_prescricao_base64}`}
                alt="Prescrição enviada"
                className="modal-imagem"
              />
            )}
          </div>
        </div>
      )}

      {/* Estado de carregamento do modal (enquanto a imagem em base64 ainda não chegou) */}
      {carregandoDetalhes && !detalhes && (
        <div className="modal-overlay">
          <div className="modal-conteudo">
            <p>Carregando detalhes...</p>
          </div>
        </div>
      )}

      {/* Erro ao carregar o detalhe (ex: token expirado, acesso negado) */}
      {erroDetalhes && (
        <div className="modal-overlay" onClick={fecharDetalhes}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <button className="modal-fechar" onClick={fecharDetalhes}>×</button>
            <p>{erroDetalhes}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}