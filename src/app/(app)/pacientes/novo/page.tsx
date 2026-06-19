import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PacienteForm } from "@/components/pacientes/PacienteForm";

export default function NovoPacientePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/pacientes" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Pacientes</Link>
        <h1 className="text-xl font-semibold">Novo paciente</h1>
      </div>
      <PacienteForm />
    </div>
  );
}
