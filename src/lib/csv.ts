// Gera CSV com BOM UTF-8 (abre corretamente no Excel) a partir de linhas-objeto.
export function gerarCSV(linhas: Record<string, string | number>[], colunas?: string[]): string {
  if (linhas.length === 0) return "\uFEFF";
  const cols = colunas ?? Object.keys(linhas[0]);
  const escapar = (v: unknown) => {
    const s = String(v ?? "");
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cabecalho = cols.join(";");
  const corpo = linhas.map((l) => cols.map((c) => escapar(l[c])).join(";")).join("\n");
  return "\uFEFF" + cabecalho + "\n" + corpo;
}
