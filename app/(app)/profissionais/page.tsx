import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { formatarCPF } from "@/lib/utils";
import { EspecialidadesPanel } from "@/components/profissionais/EspecialidadesPanel";

export const dynamic = "force-dynamic";

export default async function ProfissionaisPage() {
  const s = await getSessao();
  const filtro = s?.role !== "ADMIN" && s?.unidadeId ? { unidadeId: s.unidadeId } : {};
  const [profissionais, especialidades] = await Promise.all([
    prisma.profissional.findMany({
      where: { deletedAt: null, ...filtro },
      include: { especialidade: true, _count: { select: { agendaSemanal: true } } },
      orderBy: { nome: "asc" },
    }),
    prisma.especialidade.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Profissionais</h1>
          <p className="text-sm text-ink-soft">{profissionais.length} cadastrado(s)</p>
        </div>
        <Link href="/profissionais/novo" className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          <Plus className="h-4 w-4" /> Novo profissional
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="overflow-hidden rounded-xl border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b bg-surface-2 text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Conselho</th>
                <th className="px-4 py-3 font-medium">Especialidade</th>
                <th className="px-4 py-3 font-medium">Agenda</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {profissionais.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-soft">Nenhum profissional cadastrado.</td></tr>
              ) : profissionais.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <Link href={`/profissionais/${p.id}/editar`} className="font-medium hover:text-brand">{p.nome}</Link>
                    <div className="font-mono text-xs text-ink-soft">{formatarCPF(p.cpf)}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{[p.conselho, p.numeroRegistro].filter(Boolean).join(" ") || "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.especialidade?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{p._count.agendaSemanal} janela(s)</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.ativo ? "bg-emerald-500/15 text-emerald-600" : "bg-zinc-500/15 text-zinc-500"}`}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EspecialidadesPanel iniciais={especialidades} />
      </div>
    </div>
  );
}
