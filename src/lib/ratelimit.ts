// Limitador simples em memória (por instância). Para múltiplas instâncias,
// troque por Redis. Suficiente para mitigar abuso básico em um único VPS.
type Registro = { count: number; reset: number };
const baldes = new Map<string, Registro>();

export function limitar(chave: string, max: number, janelaMs: number): { ok: boolean; restante: number } {
  const agora = Date.now();
  const r = baldes.get(chave);
  if (!r || agora > r.reset) {
    baldes.set(chave, { count: 1, reset: agora + janelaMs });
    return { ok: true, restante: max - 1 };
  }
  r.count++;
  return { ok: r.count <= max, restante: Math.max(0, max - r.count) };
}

export function ipDe(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconhecido";
}
