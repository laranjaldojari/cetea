import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { NovoRegistro } from "@/components/prontuario/NovoRegistro";
import { RegistroCard } from "@/components/prontuario/RegistroCard";

export const dynamic = "force-dynamic";

export default async function ProntuarioPage({ params }: { params: { id: string } }) {
  const paciente = await prisma.paciente.findFirst({
    where: { id: params.id, deletedAt: null }, select: { id: true, nomeCompleto: true, nomeSocial: true },
  });
  if (!paciente) notFound();

  const registros = await prisma.registroProntuario.findMany({
    where: { pacienteId: params.id },
    include: { autor: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
  });
  // Mostra apenas a versão vigente de cada registro (não as superadas)
  const superadas = new Set(registros.map((r) => r.versaoAnteriorId).filter(Boolean) as string[]);
  const atuais = registros.filter((r) => !superadas.has(r.id));
  const nome = paciente.nomeSocial || paciente.nomeCompleto;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/pacientes/${paciente.id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Ficha</Link>
          <h1 className="text-xl font-semibold">Prontuário — {nome}</h1>
          <p className="text-sm text-ink-soft">{atuais.length} registro(s) vigente(s)</p>
        </div>
        <NovoRegistro pacienteId={paciente.id} />
      </div>

      {atuais.length === 0 ? (
        <div className="rounded-xl border bg-surface p-10 text-center text-ink-soft">Nenhum registro no prontuário.</div>
      ) : (
        <div className="space-y-3">
          {atuais.map((r) => (
            <RegistroCard key={r.id} registro={{
              id: r.id, pacienteId: paciente.id, tipo: r.tipo, conteudo: r.conteudo, dados: r.dados, assinado: r.assinado,
              assinaturaHash: r.assinaturaHash, versao: r.versao, versaoAnteriorId: r.versaoAnteriorId,
              autorNome: r.autor?.nome ?? "—", createdAt: r.createdAt.toISOString(),
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
