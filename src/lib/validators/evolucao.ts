import { z } from "zod";

export const TIPOS_DOC = ["LAUDO", "EXAME", "RELATORIO", "RECEITA", "ENCAMINHAMENTO", "OUTRO"] as const;

export const anexoSchema = z.object({
  tipo: z.enum(TIPOS_DOC).default("OUTRO"),
  nome: z.string().min(1),
  url: z.string().url("URL inválida"),
});

export const criarEvolucaoSchema = z.object({
  pacienteId: z.string().min(1, "Paciente é obrigatório"),
  profissionalId: z.string().min(1, "Selecione o profissional"),
  agendamentoId: z.string().optional().or(z.literal("")),
  data: z.string().optional().or(z.literal("")),
  tipoAtendimento: z.string().optional().or(z.literal("")),
  evolucao: z.string().min(1, "Descreva a evolução"),
  intercorrencias: z.string().optional().or(z.literal("")),
  conduta: z.string().optional().or(z.literal("")),
  anexos: z.array(anexoSchema).default([]),
});

export const editarEvolucaoSchema = z.object({
  tipoAtendimento: z.string().optional().or(z.literal("")),
  evolucao: z.string().min(1, "Descreva a evolução"),
  intercorrencias: z.string().optional().or(z.literal("")),
  conduta: z.string().optional().or(z.literal("")),
});
