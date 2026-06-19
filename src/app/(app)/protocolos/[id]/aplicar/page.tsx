import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { opcoesPacientes } from "@/server/pacienteOpcoes";
import { AplicarForm } from "@/components/protocolos/AplicarForm";
import type { DefinicaoProtocolo } from "@/server/protocolos";

export const dynamic = "force-dynamic";

export default async function AplicarPage({ params, searchParams }: { params: { id: string }; searchParams: { paciente?: string } }) {
  const s = await getSessao();
  const [protocolo, pacientes] = await Promise.all([
    prisma.protocolo.findUnique({ where: { id: params.id } }),
    opcoesPacientes(s),
  ]);
  if (!protocolo) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/protocolos" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Protocolos</Link>
        <h1 className="text-xl font-semibold">{protocolo.nome}</h1>
      </div>
      <AplicarForm
        protocoloId={protocolo.id}
        definicao={protocolo.definicao as unknown as DefinicaoProtocolo}
        pacientes={pacientes}
        pacienteIdInicial={searchParams.paciente}
      />
    </div>
  );
}
