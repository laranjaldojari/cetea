import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getSessao } from "@/lib/auth/session";
import { opcoesPacientes } from "@/server/pacienteOpcoes";
import { NovoPtiForm } from "@/components/pti/NovoPtiForm";

export const dynamic = "force-dynamic";

export default async function NovoPtiPage() {
  const s = await getSessao();
  const pacientes = await opcoesPacientes(s);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/pti" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> PTI</Link>
        <h1 className="text-xl font-semibold">Novo plano terapêutico</h1>
      </div>
      <NovoPtiForm pacientes={pacientes} />
    </div>
  );
}
