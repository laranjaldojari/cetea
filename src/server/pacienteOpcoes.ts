import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth/jwt";

export async function opcoesPacientes(s: SessionPayload | null) {
  const filtro = s && s.role !== "ADMIN" && s.unidadeId ? { unidadeId: s.unidadeId } : {};
  const pacientes = await prisma.paciente.findMany({
    where: { deletedAt: null, ...filtro },
    select: { id: true, nomeCompleto: true, nomeSocial: true },
    orderBy: { nomeCompleto: "asc" }, take: 500,
  });
  return pacientes.map((p) => ({ id: p.id, nome: p.nomeSocial || p.nomeCompleto }));
}
