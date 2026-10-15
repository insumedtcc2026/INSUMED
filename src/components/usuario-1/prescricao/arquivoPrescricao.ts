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

// ---------------------------------------------------------
// Envio do arquivo (envio novo e reenvio usam as mesmas regras)
// ---------------------------------------------------------

export const TAMANHO_MAX_PRESCRICAO = 5 * 1024 * 1024;

/** Imagem ou PDF, até 5 MB (o backend confere de novo). Devolve o erro ou null. */
export function erroArquivoPrescricao(arquivo: File): string | null {
  const tipoValido = arquivo.type.startsWith("image/") || arquivo.type === "application/pdf";
  if (!tipoValido) return "Formato não suportado. Envie uma imagem (JPG, PNG) ou um PDF.";
  if (arquivo.size > TAMANHO_MAX_PRESCRICAO) return "A prescrição deve ter no máximo 5 MB.";
  return null;
}

/** Lê o arquivo e devolve só o conteúdo em Base64 (sem o prefixo "data:...;base64,"). */
export function arquivoParaBase64(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onloadend = () => {
      const resultado = leitor.result;
      if (typeof resultado !== "string") {
        reject(new Error("Falha ao converter arquivo."));
        return;
      }
      resolve(resultado.split(",")[1]);
    };
    leitor.onerror = () => reject(new Error("Falha ao ler arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}
