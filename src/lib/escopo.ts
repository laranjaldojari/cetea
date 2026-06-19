import { prisma } from "@/lib/db";

interface EscopoSessao { role: string; unidadeId?: string | null }

/** ADMIN enxerga todas as unidades; demais só a própria. Sem unidade definida, nega. */
export function unidadeOk(s: EscopoSessao, unidadeId: string | null | undefined): boolean {
  if (s.role === "ADMIN") return true;
  if (!s.unidadeId) return false;
  return unidadeId === s.unidadeId;
}

/** Verifica se o paciente está na unidade do usuário. */
export async function pacienteNoEscopo(s: EscopoSessao, pacienteId: string): Promise<boolean> {
  if (s.role === "ADMIN") return true;
  const p = await prisma.paciente.findUnique({ where: { id: pacienteId }, select: { unidadeId: true } });
  return Boolean(p && unidadeOk(s, p.unidadeId));
}
