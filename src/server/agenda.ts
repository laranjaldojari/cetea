import { prisma } from "@/lib/db";
import type { CriarAgendamentoInput } from "@/lib/validators/agendamento";

/**
 * Verifica se há conflito de horário para o MESMO profissional.
 * Dois intervalos colidem quando: inicioA < fimB && fimA > inicioB.
 * Agendamentos cancelados são ignorados. `ignorarId` exclui o próprio
 * registro ao reagendar.
 */
export async function detectarConflito(params: {
  profissionalId: string;
  inicio: Date;
  fim: Date;
  ignorarId?: string;
}) {
  const { profissionalId, inicio, fim, ignorarId } = params;
  return prisma.agendamento.findFirst({
    where: {
      profissionalId,
      status: { not: "CANCELADO" },
      ...(ignorarId ? { id: { not: ignorarId } } : {}),
      inicio: { lt: fim },
      fim: { gt: inicio },
    },
    select: { id: true, inicio: true, fim: true },
  });
}

/** Janelas de lembrete: 7 dias, 1 dia e 2 horas antes do atendimento. */
function janelasLembrete(inicio: Date): Date[] {
  const ms = inicio.getTime();
  return [
    new Date(ms - 7 * 24 * 60 * 60 * 1000),
    new Date(ms - 1 * 24 * 60 * 60 * 1000),
    new Date(ms - 2 * 60 * 60 * 1000),
  ];
}

/** Cria agendamento + lembretes pendentes (envio é da Fase 4). */
export async function criarAgendamento(data: CriarAgendamentoInput, autorId: string) {
  const inicio = new Date(data.inicio);
  const fim = new Date(data.fim);

  const conflito = await detectarConflito({ profissionalId: data.profissionalId, inicio, fim });
  if (conflito) return { erro: "conflito" as const, conflito };

  const ag = await prisma.agendamento.create({
    data: {
      pacienteId: data.pacienteId,
      profissionalId: data.profissionalId,
      unidadeId: data.unidadeId,
      tipo: data.tipo,
      inicio,
      fim,
      observacao: data.observacao || null,
    },
    include: { paciente: { select: { nomeCompleto: true, nomeSocial: true, email: true, telefones: true } } },
  });

  // Gera lembretes (WhatsApp + e-mail) para cada janela futura
  const agora = Date.now();
  const lembretes = janelasLembrete(inicio).filter((d) => d.getTime() > agora);
  const destinoEmail = ag.paciente.email;
  const destinoFone = ag.paciente.telefones[0];
  await prisma.notificacao.createMany({
    data: lembretes.flatMap((quando) => {
      const conteudo = `Lembrete: atendimento (${data.tipo.toLowerCase()}) em ${inicio.toLocaleString("pt-BR")}.`;
      const itens = [] as any[];
      if (destinoFone) itens.push({ agendamentoId: ag.id, canal: "WHATSAPP", destino: destinoFone, conteudo, agendadaPara: quando });
      if (destinoEmail) itens.push({ agendamentoId: ag.id, canal: "EMAIL", destino: destinoEmail, conteudo, agendadaPara: quando });
      return itens;
    }),
  });

  await prisma.auditLog.create({ data: { userId: autorId, acao: "CREATE", entidade: "Agendamento", entidadeId: ag.id } });
  return { ag };
}

/** Lista agendamentos num intervalo (para a grade do calendário). */
export async function listarPorIntervalo(params: {
  inicio: Date;
  fim: Date;
  profissionalId?: string;
  unidadeId?: string | null;
}) {
  return prisma.agendamento.findMany({
    where: {
      inicio: { gte: params.inicio, lt: params.fim },
      ...(params.profissionalId ? { profissionalId: params.profissionalId } : {}),
      ...(params.unidadeId ? { unidadeId: params.unidadeId } : {}),
    },
    orderBy: { inicio: "asc" },
    include: {
      paciente: { select: { id: true, nomeCompleto: true, nomeSocial: true } },
      profissional: { select: { id: true, nome: true } },
    },
  });
}
