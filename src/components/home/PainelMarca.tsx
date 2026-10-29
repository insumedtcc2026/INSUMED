import marca from "../../assets/home-log/marca-branca.webp";
import nome from "../../assets/home-log/insumed-texto.webp";
import "../../css/home/PainelMarca.css";

/**
 * Painel azul do login e do cadastro: fundo com manchas de luz que se
 * movem devagar e a logo entrando (marca,
 * depois o nome, depois um brilho). Com "reduzir movimento" fica parado.
 */
export default function PainelMarca() {
  return (
    <div className="login-image-panel painel-marca" aria-hidden="true">
      <span className="painel-marca__luz painel-marca__luz--a" />
      <span className="painel-marca__luz painel-marca__luz--b" />
      <span className="painel-marca__luz painel-marca__luz--c" />
      <span className="painel-marca__anel" />

      <div className="painel-marca__logo">
        <span className="painel-marca__simbolo">
          <img src={marca} alt="" width={485} height={455} draggable={false} />
        </span>
        <img className="painel-marca__nome" src={nome} alt="" width={686} height={124} draggable={false} />
      </div>
    </div>
  );
}
