import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatarData } from "@/lib/utils";
import { pontuar, type DefinicaoProtocolo, type Respostas } from "@/server/protocolos";
import { BotaoImprimir } from "@/components/protocolos/BotaoImprimir";

export const dynamic = "force-dynamic";

export default async function ImprimirPage({ params }: { params: { id: string } }) {
  const a = await prisma.protocoloAplicacao.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      protocolo: true,
      paciente: { select: { nomeCompleto: true, nomeSocial: true, cpf: true, dataNascimento: true } },
    },
  });
  if (!a) notFound();

  const def = a.protocolo.definicao as unknown as DefinicaoProtocolo;
  const resultado = pontuar(def, a.respostas as Respostas);
  const nome = a.paciente.nomeSocial || a.paciente.nomeCompleto;

  return (
    <div className="mx-auto max-w-2xl space-y-5 bg-white p-2 text-black">
      <style>{`@media print { .no-print { display:none } body { background:#fff } } @page { margin: 16mm }`}</style>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{a.protocolo.nome}</h1>
          <p className="text-sm">Relatório de avaliação · {formatarData(a.createdAt)}</p>
        </div>
        <BotaoImprimir />
      </div>

      <div className="rounded border p-3 text-sm">
        <p><strong>Paciente:</strong> {nome}</p>
        <p><strong>Nascimento:</strong> {formatarData(a.paciente.dataNascimento)}</p>
        {def.respondente && <p><strong>Respondente:</strong> {def.respondente}</p>}
      </div>

      <div className="rounded border p-3">
        <p className="text-sm"><strong>Pontuação total:</strong> {resultado.pontuacaoTotal}</p>
        <p className="text-sm"><strong>Classificação:</strong> {resultado.classificacao}</p>
        {resultado.subescalas && (
          <ul className="mt-2 text-sm">
            {resultado.subescalas.map((s) => <li key={s.nome}>{s.nome}: soma {s.soma} · média {s.media}</li>)}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-1 text-sm font-bold">Respostas</h2>
        <ol className="text-sm">
          {def.itens.map((item, i) => {
            const r = (a.respostas as Respostas)[item.id];
            const txt = r === undefined || r === "" ? "—" : typeof r === "boolean" ? (r ? "Presente" : "—") : String(r);
            return <li key={item.id} className="flex justify-between border-b py-0.5"><span>{i + 1}. {item.texto}</span><span><strong>{txt}</strong></span></li>;
          })}
        </ol>
      </div>

      {def.itensExemplo && <p className="text-xs italic">Observação: itens de exemplo. Substituir pelo texto oficial licenciado antes do uso clínico.</p>}
      <p className="text-xs">Documento gerado pelo sistema CETEA. A interpretação clínica é de responsabilidade do profissional.</p>
    </div>
  );
}
