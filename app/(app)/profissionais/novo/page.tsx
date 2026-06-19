import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { ProfissionalForm } from "@/components/profissionais/ProfissionalForm";

export const dynamic = "force-dynamic";

export default async function NovoProfissionalPage() {
  const s = await getSessao();
  const [especialidades, unidades] = await Promise.all([
    prisma.especialidade.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
    prisma.unidade.findMany({
      where: { deletedAt: null, ...(s?.role !== "ADMIN" && s?.unidadeId ? { id: s.unidadeId } : {}) },
      orderBy: { nome: "asc" }, select: { id: true, nome: true },
    }),
  ]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/profissionais" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Profissionais</Link>
        <h1 className="text-xl font-semibold">Novo profissional</h1>
      </div>
      <ProfissionalForm especialidades={especialidades} unidades={unidades} />
    </div>
  );
}
