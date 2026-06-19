import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { Calendar } from "@/components/agenda/Calendar";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const s = await getSessao();
  if (!s) redirect("/login");

  const filtroUnidade = s.role !== "ADMIN" && s.unidadeId ? { unidadeId: s.unidadeId } : {};

  const [profissionais, pacientes, fila, unidade] = await Promise.all([
    prisma.profissional.findMany({
      where: { ativo: true, deletedAt: null, ...filtroUnidade },
      select: { id: true, nome: true }, orderBy: { nome: "asc" },
    }),
    prisma.paciente.findMany({
      where: { deletedAt: null, status: { not: "INATIVO" }, ...filtroUnidade },
      select: { id: true, nomeCompleto: true, nomeSocial: true }, orderBy: { nomeCompleto: "asc" }, take: 500,
    }),
    prisma.paciente.findMany({
      where: { deletedAt: null, status: "FILA_ESPERA", ...filtroUnidade },
      select: { id: true, nomeCompleto: true, nomeSocial: true }, orderBy: { createdAt: "asc" },
    }),
    s.unidadeId
      ? prisma.unidade.findUnique({ where: { id: s.unidadeId }, select: { id: true } })
      : prisma.unidade.findFirst({ select: { id: true } }),
  ]);

  if (!unidade) {
    return (
      <div className="rounded-xl border bg-surface p-8 text-center text-ink-soft">
        Cadastre uma unidade antes de usar a agenda.
      </div>
    );
  }

  const opc = (arr: { id: string; nomeCompleto?: string; nome?: string; nomeSocial?: string | null }[]) =>
    arr.map((p) => ({ id: p.id, nome: p.nome ?? p.nomeSocial ?? p.nomeCompleto ?? "—" }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Agenda</h1>
        <p className="text-sm text-ink-soft">Agendamento de consultas, avaliações e terapias.</p>
      </div>
      <Calendar
        pacientes={opc(pacientes)}
        profissionais={opc(profissionais)}
        filaEspera={opc(fila)}
        unidadeId={unidade.id}
      />
    </div>
  );
}
