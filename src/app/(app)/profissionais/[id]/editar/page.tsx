import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { ProfissionalForm } from "@/components/profissionais/ProfissionalForm";

export const dynamic = "force-dynamic";

export default async function EditarProfissionalPage({ params }: { params: { id: string } }) {
  const s = await getSessao();
  const [profissional, especialidades, unidades] = await Promise.all([
    prisma.profissional.findFirst({
      where: { id: params.id, deletedAt: null },
      include: { agendaSemanal: { orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }] } },
    }),
    prisma.especialidade.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
    prisma.unidade.findMany({
      where: { deletedAt: null, ...(s?.role !== "ADMIN" && s?.unidadeId ? { id: s.unidadeId } : {}) },
      orderBy: { nome: "asc" }, select: { id: true, nome: true },
    }),
  ]);
  if (!profissional) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/profissionais" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Profissionais</Link>
        <h1 className="text-xl font-semibold">Editar profissional</h1>
      </div>
      <ProfissionalForm inicial={JSON.parse(JSON.stringify(profissional))} especialidades={especialidades} unidades={unidades} />
    </div>
  );
}
