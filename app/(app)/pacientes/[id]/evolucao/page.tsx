import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils";
import { hhmm } from "@/lib/date";
import { NovaEvolucao } from "@/components/evolucao/NovaEvolucao";
import { EvolucaoCard } from "@/components/evolucao/EvolucaoCard";

export const dynamic = "force-dynamic";

export default async function EvolucaoPacientePage({ params }: { params: { id: string } }) {
  const s = await getSessao();
  const paciente = await prisma.paciente.findFirst({ where: { id: params.id, deletedAt: null }, select: { id: true, nomeCompleto: true, nomeSocial: true, unidadeId: true } });
  if (!paciente) notFound();

  const desde = new Date(); desde.setDate(desde.getDate() - 90);
  const [evolucoes, profissionais, agendamentos] = await Promise.all([
    prisma.evolucao.findMany({
      where: { pacienteId: params.id },
      include: { profissional: { select: { nome: true } }, autor: { select: { nome: true } }, documentos: true },
      orderBy: { data: "desc" },
    }),
    prisma.profissional.findMany({
      where: { ativo: true, deletedAt: null, ...(s?.role !== "ADMIN" && s?.unidadeId ? { unidadeId: s.unidadeId } : {}) },
      select: { id: true, nome: true }, orderBy: { nome: "asc" },
    }),
    prisma.agendamento.findMany({
      where: { pacienteId: params.id, inicio: { gte: desde }, evolucao: { is: null } },
      orderBy: { inicio: "desc" }, take: 30,
    }),
  ]);

  const nome = paciente.nomeSocial || paciente.nomeCompleto;
  const agOpc = agendamentos.map((a) => ({ id: a.id, tipo: a.tipo, label: `${formatarData(a.inicio)} ${hhmm(new Date(a.inicio))} · ${a.tipo.toLowerCase()} (${a.status.toLowerCase()})` }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/pacientes/${paciente.id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Ficha</Link>
          <h1 className="text-xl font-semibold">Evolução terapêutica — {nome}</h1>
          <p className="text-sm text-ink-soft">{evolucoes.length} sessão(ões) registrada(s)</p>
        </div>
        <NovaEvolucao pacienteId={paciente.id} profissionais={profissionais} agendamentos={agOpc} />
      </div>

      {evolucoes.length === 0 ? (
        <div className="rounded-xl border bg-surface p-10 text-center text-ink-soft">Nenhuma evolução registrada.</div>
      ) : (
        <div className="space-y-3">
          {evolucoes.map((e) => (
            <EvolucaoCard key={e.id} ev={{
              id: e.id, data: e.data.toISOString(), tipoAtendimento: e.tipoAtendimento, evolucao: e.evolucao,
              intercorrencias: e.intercorrencias, conduta: e.conduta,
              profissionalNome: e.profissional.nome, autorNome: e.autor?.nome ?? "—",
              vinculada: Boolean(e.agendamentoId),
              anexos: e.documentos.map((d) => ({ id: d.id, nome: d.nome, url: d.url, tipo: d.tipo })),
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
