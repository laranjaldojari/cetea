import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, Printer } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatarData } from "@/lib/utils";
import { pontuar, type DefinicaoProtocolo, type Respostas } from "@/server/protocolos";
import { ExcluirAplicacao } from "@/components/protocolos/ExcluirAplicacao";

export const dynamic = "force-dynamic";

export default async function ResultadoPage({ params }: { params: { id: string } }) {
  const a = await prisma.protocoloAplicacao.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { protocolo: true, paciente: { select: { nomeCompleto: true, nomeSocial: true } } },
  });
  if (!a) notFound();

  const def = a.protocolo.definicao as unknown as DefinicaoProtocolo;
  const resultado = pontuar(def, a.respostas as Respostas);
  const nome = a.paciente.nomeSocial || a.paciente.nomeCompleto;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/protocolos" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Protocolos</Link>
          <h1 className="text-xl font-semibold">{a.protocolo.nome}</h1>
          <p className="text-sm text-ink-soft">{nome} · {formatarData(a.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/protocolos/aplicacao/${a.id}/imprimir`} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-surface-2"><Printer className="h-4 w-4" /> PDF</Link>
          <Link href={`/protocolos/aplicacao/${a.id}/editar`} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"><Pencil className="h-4 w-4" /> Editar</Link>
          <ExcluirAplicacao id={a.id} />
        </div>
      </div>

      <div className="rounded-xl border bg-surface p-6 text-center">
        <p className="text-5xl font-semibold tabular-nums">{resultado.pontuacaoTotal}</p>
        <p className="text-sm text-ink-soft">pontos</p>
        <p className="mt-3 inline-block rounded-lg bg-brand/10 px-4 py-2 font-medium text-brand">{resultado.classificacao}</p>
      </div>

      {resultado.subescalas && (
        <div className="rounded-xl border bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold">Subescalas</h2>
          <ul className="space-y-1 text-sm">
            {resultado.subescalas.map((sub) => (
              <li key={sub.nome} className="flex justify-between border-b py-1.5 last:border-0">
                <span>{sub.nome}</span>
                <span className="tabular-nums text-ink-soft">soma {sub.soma} · média {sub.media}{sub.classificacao ? ` · ${sub.classificacao}` : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border bg-surface p-4">
        <h2 className="mb-2 text-sm font-semibold">Respostas</h2>
        <ol className="space-y-1 text-sm">
          {def.itens.map((item, i) => {
            const r = (a.respostas as Respostas)[item.id];
            const txt = r === undefined || r === "" ? "—" : typeof r === "boolean" ? (r ? "Presente" : "—") : String(r);
            return (
              <li key={item.id} className="flex justify-between gap-3 border-b py-1 last:border-0">
                <span className="text-ink-soft">{i + 1}. {item.texto}</span>
                <span className="shrink-0 font-medium">{txt}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
