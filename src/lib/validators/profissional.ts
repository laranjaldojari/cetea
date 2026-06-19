import { z } from "zod";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const janelaAgendaSchema = z
  .object({
    diaSemana: z.number().int().min(0).max(6), // 0=Domingo … 6=Sábado
    horaInicio: z.string().regex(HHMM, "Hora inválida"),
    horaFim: z.string().regex(HHMM, "Hora inválida"),
  })
  .refine((j) => j.horaInicio < j.horaFim, { message: "Início deve ser antes do fim", path: ["horaFim"] });

export const profissionalSchema = z.object({
  nome: z.string().min(3, "Informe o nome"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  conselho: z.string().optional().or(z.literal("")),
  numeroRegistro: z.string().optional().or(z.literal("")),
  especialidadeId: z.string().optional().or(z.literal("")),
  cargaHorariaSemanal: z.coerce.number().int().min(0).max(80).optional(),
  unidadeId: z.string().optional().or(z.literal("")),
  ativo: z.boolean().default(true),
  agendaSemanal: z.array(janelaAgendaSchema).default([]),
});
export type ProfissionalInput = z.infer<typeof profissionalSchema>;

export const especialidadeSchema = z.object({ nome: z.string().min(2, "Informe a especialidade") });

export const DIAS_CLINICA = [
  { v: 1, nome: "Segunda" }, { v: 2, nome: "Terça" }, { v: 3, nome: "Quarta" },
  { v: 4, nome: "Quinta" }, { v: 5, nome: "Sexta" }, { v: 6, nome: "Sábado" }, { v: 0, nome: "Domingo" },
];
