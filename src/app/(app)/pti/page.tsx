import Link from "next/link";
import { Plus, ListChecks } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { ROTULO_STATUS_PTI } from "@/lib/validators/pti";

export const dynamic = "force-dynamic";

const COR: Record<string, string> = {
  EM_ELABORACAO: "bg-amber-500/15 text-amber-600", ATIVO: "bg-emerald-500/15 text-emerald-600",
  CONCLUIDO: "bg-sky-500/15 text-sky-600", SUSPENSO: "bg-zinc-500/15 text-zinc-500",
};

function progresso(objs: { percentualExecucao: number }[]) {
  if (!objs.length) return 0;
  return Math.round(objs.reduce((a, o) => a + o.percentualExecucao, 0) / objs.length);
}

export default async function PtiListaPage() {
  const s = await getSessao();
  const filtro = s?.role !== "ADMIN" && s?.unidadeId ? { paciente: { unidadeId: s.unidadeId } } : {};
  const planos = await prisma.pTI.findMany({
    where: filtro,
    include: { paciente: { select: { nomeCompleto: true, nomeSocial: true } }, objetivos: { select: { percentualExecucao: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Planos Terapêuticos Individuais</h1>
          <p className="text-sm text-ink-soft">{planos.length} plano(s)</p>
        </div>
        <Link href="/pti/novo" className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"><Plus className="h-4 w-4" /> Novo PTI</Link>
      </div>

      {planos.length === 0 ? (
        <div className="rounded-xl border bg-surface p-10 text-center text-ink-soft">Nenhum plano terapêutico cadastrado.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {planos.map((p) => {
            const prog = progresso(p.objetivos);
            return (
              <Link key={p.id} href={`/pti/${p.id}`} className="rounded-xl border bg-surface p-4 hover:border-brand">
                <div className="flex items-start justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-brand"><ListChecks className="h-5 w-5" /></div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COR[p.status]}`}>{ROTULO_STATUS_PTI[p.status]}</span>
                </div>
                <h3 className="mt-3 font-medium">{p.titulo}</h3>
                <p className="text-sm text-ink-soft">{p.paciente.nomeSocial || p.paciente.nomeCompleto}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
                  <div className="h-1.5 flex-1 rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand" style={{ width: `${prog}%` }} /></div>
                  <span className="tabular-nums">{prog}%</span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">{p.objetivos.length} objetivo(s)</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
