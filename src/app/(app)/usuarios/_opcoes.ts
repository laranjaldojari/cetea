import { prisma } from "@/lib/db";
import { rolesAtribuiveis } from "@/server/usuarios";

export async function opcoesForm(s: { role: string; instituicaoId: string; unidadeId?: string | null }) {
  const unidades = await prisma.unidade.findMany({
    where: { deletedAt: null, instituicaoId: s.instituicaoId, ...(s.role === "COORDENADOR" && s.unidadeId ? { id: s.unidadeId } : {}) },
    select: { id: true, nome: true }, orderBy: { nome: "asc" },
  });
  return { unidades, rolesDisponiveis: rolesAtribuiveis(s.role), travarUnidade: s.role === "COORDENADOR" };
}
