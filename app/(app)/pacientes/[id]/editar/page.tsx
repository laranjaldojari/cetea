import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PacienteForm } from "@/components/pacientes/PacienteForm";

export const dynamic = "force-dynamic";

export default async function EditarPacientePage({ params }: { params: { id: string } }) {
  const paciente = await prisma.paciente.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { responsaveis: true, comorbidades: true },
  });
  if (!paciente) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={`/pacientes/${paciente.id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Ficha</Link>
        <h1 className="text-xl font-semibold">Editar paciente</h1>
      </div>
      <PacienteForm inicial={JSON.parse(JSON.stringify(paciente))} />
    </div>
  );
}
