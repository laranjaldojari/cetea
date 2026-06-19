import { getSessao } from "@/lib/auth/session";
import { relatorioPacientes, relatorioAtendimentos, indicadoresTEA, type FiltroRelatorio } from "@/server/relatorios";
import { BotaoImprimir } from "@/components/protocolos/BotaoImprimir";

export const dynamic = "force-dynamic";

function Tabela({ titulo, linhas }: { titulo: string; linhas: [string, string | number][] }) {
  return (
    <div className="mb-4">
      <h2 className="mb-1 text-sm font-bold">{titulo}</h2>
      <table className="w-full text-sm">
        <tbody>{linhas.map(([k, v]) => <tr key={k} className="border-b"><td className="py-0.5">{k}</td><td className="py-0.5 text-right font-medium">{v}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default async function ImprimirRelatorioPage({ searchParams }: { searchParams: { inicio?: string; fim?: string } }) {
  const s = await getSessao();
  const f: FiltroRelatorio = {
    inicio: searchParams.inicio ? new Date(searchParams.inicio) : undefined,
    fim: searchParams.fim ? new Date(searchParams.fim + "T23:59:59") : undefined,
    unidadeId: s?.role !== "ADMIN" ? s?.unidadeId : undefined,
  };
  const [pac, atd, ind] = await Promise.all([relatorioPacientes(f), relatorioAtendimentos(f), indicadoresTEA(f)]);
  const periodo = searchParams.inicio || searchParams.fim ? `${searchParams.inicio ?? "…"} a ${searchParams.fim ?? "…"}` : "todos os períodos";

  return (
    <div className="mx-auto max-w-2xl space-y-4 bg-white p-2 text-black">
      <style>{`@media print { .no-print { display:none } } @page { margin: 16mm }`}</style>
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-bold">Relatório gerencial — CETEA</h1><p className="text-sm">Período: {periodo}</p></div>
        <BotaoImprimir />
      </div>
      <Tabela titulo="Pacientes por situação" linhas={pac.porStatus.map((x) => [x.status, x.total])} />
      <Tabela titulo="Pacientes por faixa etária" linhas={pac.porFaixaEtaria.map((x) => [x.faixa, x.total])} />
      <Tabela titulo="Atendimentos por profissional" linhas={atd.porProfissional.map((x) => [x.profissional, x.total])} />
      <Tabela titulo="Atendimentos por especialidade" linhas={atd.porEspecialidade.map((x) => [x.especialidade, x.total])} />
      <Tabela titulo="Indicadores TEA" linhas={[
        ...ind.porNivelSuporte.map((x) => [x.nivel, x.total] as [string, number]),
        ["Tempo médio de tratamento (dias)", ind.tempoMedioTratamentoDias],
        ["Frequência média por paciente ativo", ind.frequenciaMediaPorPacienteAtivo],
        ["Atendimentos realizados no período", ind.atendimentosRealizadosPeriodo],
      ]} />
      <p className="text-xs">Documento gerado pelo sistema CETEA para prestação de contas.</p>
    </div>
  );
}
