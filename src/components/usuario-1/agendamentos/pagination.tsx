interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}
 
type ItemPaginacao = number | "…";
 
/** Paginação simples, estilo "‹ 1 2 3 … ›". Reaproveitável em qualquer lista paginada. */
export default function Pagination({ paginaAtual, totalPaginas, onMudarPagina }: PaginationProps) {
  if (totalPaginas <= 1) return null;
 
  const paginas = paginasVisiveis(paginaAtual, totalPaginas);
 
  return (
    <nav className="mt-8 flex items-center justify-center gap-3 text-blue-600">
      <button
        type="button"
        onClick={() => onMudarPagina(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="disabled:opacity-30"
        aria-label="Página anterior"
      >
        ‹
      </button>
 
      {paginas.map((p, idx) =>
        p === "…" ? (
          <span key={`ellipsis-${idx}`} className="text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onMudarPagina(p)}
            className={p === paginaAtual ? "font-bold underline" : "hover:underline"}
          >
            {p}
          </button>
        )
      )}
 
      <button
        type="button"
        onClick={() => onMudarPagina(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="disabled:opacity-30"
        aria-label="Próxima página"
      >
        ›
      </button>
    </nav>
  );
}
 
// Mostra sempre a primeira, a última, e uma janela ao redor da página atual.
function paginasVisiveis(atual: number, total: number): ItemPaginacao[] {
  const janela = 1;
  const paginas: ItemPaginacao[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - atual) <= janela) {
      paginas.push(p);
    } else if (paginas[paginas.length - 1] !== "…") {
      paginas.push("…");
    }
  }
  return paginas;
}
 