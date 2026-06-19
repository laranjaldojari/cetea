import Link from "next/link";
import { Plus, Building2, Check } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function UnidadesPage() {
  const s = await getSessao();
  const unidades = await prisma.unidade.findMany({
    where: { deletedAt: null, ...(s?.instituicaoId ? { instituicaoId: s.instituicaoId } : {}) },
    include: { _count: { select: { profissionais: true, pacientes: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Unidades</h1>
          <p className="text-sm text-ink-soft">{unidades.length} cadastrada(s)</p>
        </div>
        <Link href="/unidades/novo" className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          <Plus className="h-4 w-4" /> Nova unidade
        </Link>
      </div>

      {unidades.length === 0 ? (
        <div className="rounded-xl border bg-surface p-10 text-center text-ink-soft">Nenhuma unidade cadastrada.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {unidades.map((u) => (
            <Link key={u.id} href={`/unidades/${u.id}/editar`} className="rounded-xl border bg-surface p-4 hover:border-brand">
              <div className="flex items-start justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-brand"><Building2 className="h-5 w-5" /></div>
                <span className="text-xs text-ink-soft">{u.cnes ? `CNES ${u.cnes}` : ""}</span>
              </div>
              <h3 className="mt-3 font-medium">{u.nome}</h3>
              <p className="text-sm text-ink-soft">{[u.municipio, u.estado].filter(Boolean).join(" / ") || "—"}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-soft">
                <span className="rounded-full bg-surface-2 px-2 py-0.5">{u.consultorios} consultórios</span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5">{u.salasTerapeuticas} salas</span>
                {u.espacoSensorial && <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-brand"><Check className="h-3 w-3" /> sensorial</span>}
                {u.salaIntegracao && <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-brand"><Check className="h-3 w-3" /> integração</span>}
              </div>
              <p className="mt-3 text-xs text-ink-soft">{u._count.profissionais} profissional(is) · {u._count.pacientes} paciente(s)</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
