import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatarData } from "@/lib/utils";
import { UploadDocumento } from "@/components/documentos/UploadDocumento";
import { ExcluirDoc } from "@/components/documentos/ExcluirDoc";

export const dynamic = "force-dynamic";

function tamanho(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function DocumentosPacientePage({ params }: { params: { id: string } }) {
  const paciente = await prisma.paciente.findFirst({ where: { id: params.id, deletedAt: null }, select: { id: true, nomeCompleto: true, nomeSocial: true } });
  if (!paciente) notFound();

  const docs = await prisma.documento.findMany({ where: { pacienteId: params.id, deletedAt: null }, orderBy: [{ nome: "asc" }, { versao: "desc" }] });
  // Agrupa por nome (versões)
  const grupos = new Map<string, typeof docs>();
  for (const d of docs) { const g = grupos.get(d.nome) ?? []; g.push(d); grupos.set(d.nome, g); }
  const nome = paciente.nomeSocial || paciente.nomeCompleto;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={`/pacientes/${paciente.id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Ficha</Link>
        <h1 className="text-xl font-semibold">Documentos — {nome}</h1>
      </div>

      <UploadDocumento pacienteId={paciente.id} />

      {grupos.size === 0 ? (
        <div className="rounded-xl border bg-surface p-10 text-center text-ink-soft">Nenhum documento.</div>
      ) : (
        <div className="space-y-3">
          {[...grupos.entries()].map(([nomeArq, versoes]) => (
            <div key={nomeArq} className="rounded-xl border bg-surface p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand" />
                <span className="font-medium">{nomeArq}</span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-soft">{versoes[0].tipo.toLowerCase()}</span>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {versoes.map((d) => (
                  <li key={d.id} className="flex items-center justify-between border-t py-1.5 first:border-0">
                    <span className="text-ink-soft">v{d.versao} · {formatarData(d.createdAt)} · {tamanho(d.tamanho)}</span>
                    <span className="flex items-center gap-1.5">
                      <a href={`/api/documentos/${d.id}/download`} className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-surface-2"><Download className="h-4 w-4" /></a>
                      <ExcluirDoc id={d.id} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
