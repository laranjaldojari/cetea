import { z } from "zod";

export const TIPOS = ["CONSULTA", "AVALIACAO", "REAVALIACAO", "TERAPIA"] as const;
export const STATUS = ["AGENDADO", "CONFIRMADO", "REALIZADO", "FALTA", "CANCELADO"] as const;

export const criarAgendamentoSchema = z
  .object({
    pacienteId: z.string().min(1, "Selecione o paciente"),
    profissionalId: z.string().min(1, "Selecione o profissional"),
    unidadeId: z.string().min(1, "Selecione a unidade"),
    tipo: z.enum(TIPOS),
    inicio: z.string().refine((v) => !isNaN(Date.parse(v)), "Início inválido"),
    fim: z.string().refine((v) => !isNaN(Date.parse(v)), "Fim inválido"),
    observacao: z.string().optional(),
  })
  .refine((d) => new Date(d.fim) > new Date(d.inicio), {
    message: "O horário final deve ser após o inicial",
    path: ["fim"],
  });
export type CriarAgendamentoInput = z.infer<typeof criarAgendamentoSchema>;

// Ações sobre um agendamento existente
export const atualizarAgendamentoSchema = z.object({
  acao: z.enum(["reagendar", "confirmar", "realizar", "falta", "cancelar"]),
  inicio: z.string().optional(),
  fim: z.string().optional(),
  motivoCancelamento: z.string().optional(),
});
export type AtualizarAgendamentoInput = z.infer<typeof atualizarAgendamentoSchema>;
