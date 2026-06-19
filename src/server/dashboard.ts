import { prisma } from "@/lib/db";
import { idade } from "@/lib/utils";

export interface Indicadores {
  totalPacientes: number;
  ativos: number;
  filaEspera: number;
  agendadas: number;
  realizadas: number;
  profissionaisAtivos: number;
  absenteismo: number;            // %
  porFaixaEtaria: { faixa: string; total: number }[];
  porNivelSuporte: { nivel: string; total: number }[];
}

export async function obterIndicadores(): Promise<Indicadores> {
  const inicioMes = new Date();
  inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);

  const [totalPacientes, ativos, filaEspera, agendadas, realizadas, faltas, profissionaisAtivos, pacientes] =
    await Promise.all([
      prisma.paciente.count({ where: { deletedAt: null } }),
      prisma.paciente.count({ where: { status: "ATIVO", deletedAt: null } }),
      prisma.paciente.count({ where: { status: "FILA_ESPERA", deletedAt: null } }),
      prisma.agendamento.count({ where: { inicio: { gte: inicioMes }, status: { in: ["AGENDADO", "CONFIRMADO"] } } }),
      prisma.agendamento.count({ where: { realizadoEm: { gte: inicioMes }, status: "REALIZADO" } }),
      prisma.agendamento.count({ where: { inicio: { gte: inicioMes }, status: "FALTA" } }),
      prisma.profissional.count({ where: { ativo: true, deletedAt: null } }),
      prisma.paciente.findMany({ where: { deletedAt: null }, select: { dataNascimento: true, nivelSuporte: true } }),
    ]);

  const totalConcluidas = realizadas + faltas;
  const absenteismo = totalConcluidas ? Math.round((faltas / totalConcluidas) * 100) : 0;

  const faixas = { "0–5": 0, "6–11": 0, "12–17": 0, "18+": 0 } as Record<string, number>;
  const niveis = { NIVEL_1: 0, NIVEL_2: 0, NIVEL_3: 0, NAO_AVALIADO: 0 } as Record<string, number>;
  for (const p of pacientes) {
    const a = idade(p.dataNascimento);
    if (a <= 5) faixas["0–5"]++; else if (a <= 11) faixas["6–11"]++;
    else if (a <= 17) faixas["12–17"]++; else faixas["18+"]++;
    niveis[p.nivelSuporte]++;
  }

  return {
    totalPacientes, ativos, filaEspera, agendadas, realizadas, profissionaisAtivos, absenteismo,
    porFaixaEtaria: Object.entries(faixas).map(([faixa, total]) => ({ faixa, total })),
    porNivelSuporte: Object.entries(niveis).map(([nivel, total]) => ({ nivel, total })),
  };
}
