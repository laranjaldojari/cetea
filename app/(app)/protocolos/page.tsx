import Link from "next/link";
import { ClipboardList, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProtocolosPage() {
  const s = await getSessao();
  const filtro = s?.role !== "ADMIN" && s?.unidadeId ? { paciente: { unidadeId: s.unidadeId } } : {};
  const [protocolos, aplicacoes] = await Promise.all([
    prisma.protocolo.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.protocoloAplicacao.findMany({
      where: { deletedAt: null, ...filtro },
      include: { protocolo: { select: { nome: true } }, paciente: { select: { nomeCompleto: true, nomeSocial: true } } },
      orderBy: { createdAt: "desc" }, take: 15,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Protocolos de avaliação</h1>
        <p className="text-sm text-ink-soft">Aplicação online com correção e classificação automáticas.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {protocolos.map((p) => {
          const def = p.definicao as any;
          return (
            <Link key={p.id} href={`/protocolos/${p.id}/aplicar`} className="rounded-xl border bg-surface p-4 hover:border-brand">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-brand"><ClipboardList className="h-5 w-5" /></div>
              <h3 className="mt-3 font-medium">{p.nome}</h3>
              <p className="text-sm text-ink-soft">{def?.respondente ?? ""} · {def?.itens?.length ?? 0} itens</p>
              <span className="mt-3 inline-block text-sm font-medium text-brand">Aplicar →</span>
            </Link>
          );
        })}
      </div>

      <section className="rounded-xl border bg-surface">
        <h2 className="border-b px-4 py-3 text-sm font-semibold">Avaliações recentes</h2>
        {aplicacoes.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">Nenhuma avaliação aplicada ainda.</p>
        ) : (
          <ul>
            {aplicacoes.map((a) => (
              <li key={a.id}>
                <Link href={`/protocolos/aplicacao/${a.id}`} className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0 hover:bg-surface-2">
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-ink-soft" /> {a.paciente.nomeSocial || a.paciente.nomeCompleto}</span>
                  <span className="text-ink-soft">{a.protocolo.nome.split(" — ")[0]} · {a.classificacao} · {formatarData(a.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
