import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { UnidadeForm } from "@/components/unidades/UnidadeForm";

export const dynamic = "force-dynamic";

export default async function EditarUnidadePage({ params }: { params: { id: string } }) {
  const s = await getSessao();
  const unidade = await prisma.unidade.findFirst({
    where: { id: params.id, deletedAt: null, ...(s?.instituicaoId ? { instituicaoId: s.instituicaoId } : {}) },
  });
  if (!unidade) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/unidades" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Unidades</Link>
        <h1 className="text-xl font-semibold">Editar unidade</h1>
      </div>
      <UnidadeForm inicial={JSON.parse(JSON.stringify(unidade))} />
    </div>
  );
}
