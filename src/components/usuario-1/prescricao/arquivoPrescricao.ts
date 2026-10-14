// Utilitários do arquivo da prescrição (antes ficavam dentro do Perfil).

function extensaoPorMimetype(mimetype: string | null | undefined): string {
  const mapa: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  if (!mimetype) return "arquivo";
  return mapa[mimetype] || "arquivo";
}

export function gerarNomeArquivo(
  sol_data_solicitacao: string,
  sol_id: number,
  mimetype: string | null | undefined,
): string {
  const data = new Date(sol_data_solicitacao);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `Prescrição_${dia}-${mes}-${ano}_#${sol_id}.${extensaoPorMimetype(mimetype)}`;
}

// Converte a string base64 num Blob e devolve uma URL temporária (blob:...).
// Muito mais rápido e leve que usar "data:" URI direto num <a> ou <iframe>.
export function base64ParaBlobUrl(base64: string, mimetype: string): string {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mimetype }));
}
