import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { formatarCPF, idade } from "@/lib/utils";

const BADGE: Record<string, string> = {
  ATIVO: "bg-emerald-500/15 text-emerald-600",
  FILA_ESPERA: "bg-amber-500/15 text-amber-600",
  INATIVO: "bg-zinc-500/15 text-zinc-500",
  ALTA: "bg-sky-500/15 text-sky-600",
  TRANSFERIDO: "bg-violet-500/15 text-violet-600",
};
const ROTULO: Record<string, string> = {
  ATIVO: "Ativo", FILA_ESPERA: "Fila de espera", INATIVO: "Inativo", ALTA: "Alta", TRANSFERIDO: "Transferido",
};

export default async function PacientesPage() {
  const s = await getSessao();
  const pacientes = await prisma.paciente.findMany({
    where: { deletedAt: null, ...(s?.role !== "ADMIN" && s?.unidadeId ? { unidadeId: s.unidadeId } : {}) },
    orderBy: { nomeCompleto: "asc" }, take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pacientes</h1>
          <p className="text-sm text-ink-soft">{pacientes.length} registro(s)</p>
        </div>
        <Link href="/pacientes/novo"
          className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          <Plus className="h-4 w-4" /> Novo paciente
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b bg-surface-2 text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">CPF</th>
              <th className="px-4 py-3 font-medium">Idade</th>
              <th className="px-4 py-3 font-medium">Nível</th>
              <th className="px-4 py-3 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                Nenhum paciente cadastrado. Comece adicionando o primeiro.
              </td></tr>
            ) : pacientes.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/pacientes/${p.id}`} className="font-medium hover:text-brand">
                    {p.nomeSocial || p.nomeCompleto}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-soft">{formatarCPF(p.cpf)}</td>
                <td className="px-4 py-3 tabular-nums">{idade(p.dataNascimento)} anos</td>
                <td className="px-4 py-3 text-ink-soft">{p.nivelSuporte.replace("NIVEL_", "Nível ").replace("NAO_AVALIADO", "—")}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[p.status]}`}>
                    {ROTULO[p.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
