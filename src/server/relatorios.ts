import { prisma } from "@/lib/db";
import { idade } from "@/lib/utils";

export interface FiltroRelatorio { inicio?: Date; fim?: Date; unidadeId?: string | null }

const filtroPaciente = (f: FiltroRelatorio) => ({ deletedAt: null, ...(f.unidadeId ? { unidadeId: f.unidadeId } : {}) });

export async function relatorioPacientes(f: FiltroRelatorio) {
  const where = filtroPaciente(f);
  const [porStatus, porMunicipio, pacientes] = await Promise.all([
    prisma.paciente.groupBy({ by: ["status"], where, _count: true }),
    prisma.paciente.groupBy({ by: ["municipio"], where, _count: true }),
    prisma.paciente.findMany({ where, select: { dataNascimento: true } }),
  ]);
  const faixas: Record<string, number> = { "0–5": 0, "6–11": 0, "12–17": 0, "18+": 0 };
  for (const p of pacientes) {
    const a = idade(p.dataNascimento);
    if (a <= 5) faixas["0–5"]++; else if (a <= 11) faixas["6–11"]++; else if (a <= 17) faixas["12–17"]++; else faixas["18+"]++;
  }
  return {
    porStatus: porStatus.map((x) => ({ status: x.status, total: x._count })),
    porMunicipio: porMunicipio.map((x) => ({ municipio: x.municipio ?? "—", total: x._count })).sort((a, b) => b.total - a.total),
    porFaixaEtaria: Object.entries(faixas).map(([faixa, total]) => ({ faixa, total })),
    total: pacientes.length,
  };
}

export async function relatorioAtendimentos(f: FiltroRelatorio) {
  const where = {
    ...(f.unidadeId ? { unidadeId: f.unidadeId } : {}),
    ...(f.inicio || f.fim ? { inicio: { ...(f.inicio ? { gte: f.inicio } : {}), ...(f.fim ? { lte: f.fim } : {}) } } : {}),
  };
  const [porStatus, porProf, porUnidade, agendamentos] = await Promise.all([
    prisma.agendamento.groupBy({ by: ["status"], where, _count: true }),
    prisma.agendamento.groupBy({ by: ["profissionalId"], where, _count: true }),
    prisma.agendamento.groupBy({ by: ["unidadeId"], where, _count: true }),
    prisma.agendamento.count({ where }),
  ]);
  const profIds = porProf.map((p) => p.profissionalId);
  const profs = await prisma.profissional.findMany({ where: { id: { in: profIds } }, select: { id: true, nome: true, especialidade: { select: { nome: true } } } });
  const nomeProf = new Map(profs.map((p) => [p.id, p.nome]));
  const espDeProf = new Map(profs.map((p) => [p.id, p.especialidade?.nome ?? "—"]));
  const unidIds = porUnidade.map((u) => u.unidadeId);
  const unids = await prisma.unidade.findMany({ where: { id: { in: unidIds } }, select: { id: true, nome: true } });
  const nomeUnid = new Map(unids.map((u) => [u.id, u.nome]));

  const porEspecialidade = new Map<string, number>();
  for (const p of porProf) {
    const esp = espDeProf.get(p.profissionalId) ?? "—";
    porEspecialidade.set(esp, (porEspecialidade.get(esp) ?? 0) + p._count);
  }

  return {
    total: agendamentos,
    porStatus: porStatus.map((x) => ({ status: x.status, total: x._count })),
    porProfissional: porProf.map((x) => ({ profissional: nomeProf.get(x.profissionalId) ?? "—", total: x._count })).sort((a, b) => b.total - a.total),
    porEspecialidade: [...porEspecialidade.entries()].map(([especialidade, total]) => ({ especialidade, total })).sort((a, b) => b.total - a.total),
    porUnidade: porUnidade.map((x) => ({ unidade: nomeUnid.get(x.unidadeId) ?? "—", total: x._count })),
  };
}

export async function indicadoresTEA(f: FiltroRelatorio) {
  const where = filtroPaciente(f);
  const [porNivel, comorbidades, ativos, realizadasPeriodo] = await Promise.all([
    prisma.paciente.groupBy({ by: ["nivelSuporte"], where, _count: true }),
    prisma.comorbidade.groupBy({ by: ["descricao"], where: { paciente: where }, _count: true }),
    prisma.paciente.findMany({ where: { ...where, status: "ATIVO" }, select: { dataDiagnostico: true, createdAt: true } }),
    prisma.agendamento.count({ where: { status: "REALIZADO", ...(f.unidadeId ? { unidadeId: f.unidadeId } : {}), ...(f.inicio || f.fim ? { inicio: { ...(f.inicio ? { gte: f.inicio } : {}), ...(f.fim ? { lte: f.fim } : {}) } } : {}) } }),
  ]);

  // Tempo médio de tratamento (dias) desde o diagnóstico (ou cadastro) dos ativos
  const hoje = Date.now();
  const tempos = ativos.map((p) => {
    const ref = p.dataDiagnostico ?? p.createdAt;
    return Math.floor((hoje - new Date(ref).getTime()) / 86400000);
  });
  const tempoMedioDias = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
  const frequenciaMedia = ativos.length ? Math.round((realizadasPeriodo / ativos.length) * 10) / 10 : 0;

  return {
    porNivelSuporte: porNivel.map((x) => ({ nivel: x.nivelSuporte, total: x._count })),
    comorbidades: comorbidades.map((x) => ({ descricao: x.descricao, total: x._count })).sort((a, b) => b.total - a.total),
    tempoMedioTratamentoDias: tempoMedioDias,
    frequenciaMediaPorPacienteAtivo: frequenciaMedia,
    pacientesAtivos: ativos.length,
    atendimentosRealizadosPeriodo: realizadasPeriodo,
  };
}
