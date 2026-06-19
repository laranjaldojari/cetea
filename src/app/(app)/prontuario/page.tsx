import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { idade } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProntuarioIndexPage() {
  const s = await getSessao();
  const filtro = s?.role !== "ADMIN" && s?.unidadeId ? { unidadeId: s.unidadeId } : {};
  const pacientes = await prisma.paciente.findMany({
    where: { deletedAt: null, ...filtro },
    select: { id: true, nomeCompleto: true, nomeSocial: true, dataNascimento: true, _count: { select: { registros: true } } },
    orderBy: { nomeCompleto: "asc" }, take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Prontuário eletrônico</h1>
        <p className="text-sm text-ink-soft">Selecione um paciente para abrir o prontuário.</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-surface">
        {pacientes.length === 0 ? (
          <p className="p-10 text-center text-sm text-ink-soft">Nenhum paciente cadastrado.</p>
        ) : pacientes.map((p) => (
          <Link key={p.id} href={`/pacientes/${p.id}/prontuario`} className="flex items-center justify-between border-b px-4 py-3 last:border-0 hover:bg-surface-2">
            <span className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-ink-soft" />
              <span className="font-medium">{p.nomeSocial || p.nomeCompleto}</span>
              <span className="text-ink-soft">{idade(p.dataNascimento)} anos</span>
            </span>
            <span className="flex items-center gap-2 text-sm text-ink-soft">{p._count.registros} registro(s) <ChevronRight className="h-4 w-4" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
