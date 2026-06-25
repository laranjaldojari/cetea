import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { getInstituicao } from "@/server/configuracoes";
import { unidadeOk } from "@/lib/escopo";
import { ROTULO_TIPO_REGISTRO } from "@/lib/validators/prontuario";
import { formatarData, idade } from "@/lib/utils";
import { BotaoImprimir } from "@/components/protocolos/BotaoImprimir";

export const dynamic = "force-dynamic";

export default async function ImprimirRegistroPage({ params }: { params: { id: string; registroId: string } }) {
  const s = await getSessao();
  if (!s) return null;

  const reg: any = await prisma.registroProntuario.findFirst({
    where: { id: params.registroId, pacienteId: params.id },
    include: {
      autor: { select: { nome: true, role: true } },
      paciente: { select: { nomeCompleto: true, nomeSocial: true, dataNascimento: true, cpf: true, cns: true, unidadeId: true } },
    },
  });
  if (!reg || !unidadeOk(s, reg.paciente.unidadeId)) notFound();

  const inst = await getInstituicao(s.instituicaoId);
  const d = reg.dados ?? {};
  const nomePac = reg.paciente.nomeSocial || reg.paciente.nomeCompleto;

  return (
    <div className="mx-auto max-w-2xl bg-white p-2 text-black">
      <style>{`@media print { .no-print { display:none } } @page { margin: 18mm }`}</style>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {inst?.logoUrl ? <img src={inst.logoUrl} alt="" className="h-12 w-12 object-contain" /> : null}
          <div>
            <p className="text-base font-bold">{inst?.nome ?? "CETEA"}</p>
            <p className="text-xs">{inst?.endereco ?? ""}</p>
            <p className="text-xs">{[inst?.cnpj ? "CNPJ: " + inst.cnpj : "", inst?.cnes ? "CNES: " + inst.cnes : "", inst?.telefone ?? ""].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <BotaoImprimir />
      </div>

      <hr className="border-black" />
      <h1 className="my-3 text-center text-lg font-bold uppercase">{ROTULO_TIPO_REGISTRO[reg.tipo]}</h1>

      <div className="mb-4 text-sm">
        <p><strong>Paciente:</strong> {nomePac}</p>
        <p><strong>Nascimento:</strong> {formatarData(reg.paciente.dataNascimento)} ({idade(reg.paciente.dataNascimento)} anos){reg.paciente.cns ? ` · CNS: ${reg.paciente.cns}` : ""}</p>
      </div>

      {/* Corpo do documento */}
      {reg.tipo === "RECEITA" && Array.isArray(d.medicamentos) ? (
        <ol className="mb-6 space-y-3 text-sm">
          {d.medicamentos.filter((m: any) => m?.nome).map((m: any, i: number) => (
            <li key={i} className="border-b border-dashed pb-2">
              <p className="font-semibold">{i + 1}. {m.nome}{m.apresentacao ? ` — ${m.apresentacao}` : ""}{m.quantidade ? `  (${m.quantidade})` : ""}</p>
              <p className="pl-4">{m.posologia}</p>
            </li>
          ))}
          {d.orientacoes ? <li className="pt-2"><strong>Orientações:</strong> {d.orientacoes}</li> : null}
        </ol>
      ) : (
        <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed">{reg.conteudo}</p>
      )}

      {/* Assinatura */}
      <div className="mt-12 text-center text-sm">
        <p>_______________________________________</p>
        <p className="font-medium">{reg.autor?.nome}</p>
        <p className="text-xs">{inst?.endereco ? "" : ""}{formatarData(reg.createdAt)}</p>
      </div>

      {reg.assinado ? (
        <p className="mt-6 break-all text-center text-[10px] text-gray-500">Documento com selo de integridade (SHA-256): {reg.assinaturaHash}</p>
      ) : (
        <p className="mt-6 text-center text-xs font-bold text-gray-400">— RASCUNHO (não assinado) —</p>
      )}
    </div>
  );
}
