import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatarData } from "@/lib/utils";
import { ObjetivosManager } from "@/components/pti/ObjetivosManager";
import { ReavaliacoesPanel } from "@/components/pti/ReavaliacoesPanel";
import { PtiHeader } from "@/components/pti/PtiHeader";

export const dynamic = "force-dynamic";

export default async function PtiDetalhePage({ params }: { params: { id: string } }) {
  const pti = await prisma.pTI.findUnique({
    where: { id: params.id },
    include: {
      paciente: { select: { id: true, nomeCompleto: true, nomeSocial: true } },
      objetivos: { orderBy: { id: "asc" } },
      reavaliacoes: { orderBy: { data: "desc" } },
    },
  });
  if (!pti) notFound();

  const prog = pti.objetivos.length ? Math.round(pti.objetivos.reduce((a, o) => a + o.percentualExecucao, 0) / pti.objetivos.length) : 0;
  const nome = pti.paciente.nomeSocial || pti.paciente.nomeCompleto;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/pti" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> PTI</Link>
          <h1 className="text-xl font-semibold">{pti.titulo}</h1>
          <p className="text-sm text-ink-soft">
            <Link href={`/pacientes/${pti.paciente.id}`} className="hover:text-brand">{nome}</Link>
            {pti.inicio ? ` · início ${formatarData(pti.inicio)}` : ""}{pti.prazo ? ` · prazo ${formatarData(pti.prazo)}` : ""}
          </p>
        </div>
        <PtiHeader ptiId={pti.id} statusInicial={pti.status} />
      </div>

      <div className="rounded-xl border bg-surface p-4">
        <div className="flex items-center justify-between text-sm"><span className="font-medium">Execução geral</span><span className="tabular-nums">{prog}%</span></div>
        <div className="mt-2 h-2.5 rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand" style={{ width: `${prog}%` }} /></div>
      </div>

      <ObjetivosManager ptiId={pti.id} iniciais={pti.objetivos.map((o) => ({
        id: o.id, descricao: o.descricao, meta: o.meta, estrategias: o.estrategias,
        responsavel: o.responsavel, prazo: o.prazo ? o.prazo.toISOString() : null, percentualExecucao: o.percentualExecucao,
      }))} />

      <ReavaliacoesPanel ptiId={pti.id} iniciais={pti.reavaliacoes.map((r) => ({ id: r.id, resumo: r.resumo, data: r.data.toISOString() }))} />
    </div>
  );
}
