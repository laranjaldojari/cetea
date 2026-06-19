import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { opcoesPacientes } from "@/server/pacienteOpcoes";
import { AplicarForm } from "@/components/protocolos/AplicarForm";
import type { DefinicaoProtocolo, Respostas } from "@/server/protocolos";

export const dynamic = "force-dynamic";

export default async function EditarAplicacaoPage({ params }: { params: { id: string } }) {
  const s = await getSessao();
  const a = await prisma.protocoloAplicacao.findFirst({
    where: { id: params.id, deletedAt: null }, include: { protocolo: true },
  });
  if (!a) notFound();
  const pacientes = await opcoesPacientes(s);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/protocolos/aplicacao/${a.id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Resultado</Link>
        <h1 className="text-xl font-semibold">Editar avaliação — {a.protocolo.nome}</h1>
      </div>
      <AplicarForm
        protocoloId={a.protocoloId}
        definicao={a.protocolo.definicao as unknown as DefinicaoProtocolo}
        pacientes={pacientes}
        aplicacaoId={a.id}
        pacienteIdInicial={a.pacienteId}
        respostasIniciais={a.respostas as Respostas}
      />
    </div>
  );
}
