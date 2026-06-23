import '../../css/Insumo.css/Insumo.css';

export default function Insumo() {
    let insumo = {};
  return (
    <div className="insumo">
        <div className="insumo-container">
        <h2 className="font-bold text-lg">
          Curativo Hidrocoloide DuoDERM CGF 
        </h2>

        <p className="text-sm text-gray-500">
          Categoria: Curativo especial 
        </p>

        <div className="mt-4">
          <p>Autorizado: 10 unidades</p>
          <p>Disponível: 8 unidades</p>

          <div className={`status ${
                 3 > 0
                ? "disponivel"
                 : "indisponivel"
      }`}>
                { 1 > 0
                ? "Disponível"
                 : "Indisponível"}</div>
                    
        </div>
        </div>
        <img src={('../../assets/Insumo/63736940e9c42d56194f4d1329b7e92f61591d71 (1).png')} alt="Curativo Hidrocoloide DuoDERM CGF " className="insumo-imagem" />
        </div>
  )
}

