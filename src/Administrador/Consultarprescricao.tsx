import { useEffect, useState } from 'react';
import api from '../services/SoliciatcaoService';
import './ConsultaImagens.css';

interface ImageData {
  id: number;
  name: string;
  image: string; // base64
}

function ConsultaImagens() {
  const [imagens, setImagens] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchImagens() {
      try {
        const response = await api.get('soliciatcao');
        setImagens(response.data);
      } catch (err) {
        setImagens([]);
      } finally {
        setLoading(false);
      }
    }
    searchImagens();
  }, []);

  if (loading) return <div className="consulta-status">Carregando imagens...</div>;
  if (!imagens.length) return <div className="consulta-status">Nenhuma imagem encontrada.</div>;

  // Agrupa as imagens em blocos de 2
  const blocos = [];
  for (let i = 0; i < imagens.length; i += 2) {
    blocos.push(imagens.slice(i, i + 2));
  }

  return (
    <div className="consulta-container">
      <h2>Consulta de Imagens</h2>
      {blocos.map((bloco, idx) => (
        <div key={idx} className="consulta-bloco">
          {bloco.map(img => (
            <div key={img.id} className="consulta-card">
              <img
                src={`data:image/jpeg;base64,${img.image}`}
                alt={img.name}
                className="consulta-img"
              />
              <div className="consulta-nome">{img.name}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default ConsultaImagens;
