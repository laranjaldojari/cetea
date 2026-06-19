import { z } from "zod";

export const STATUS_PTI = ["EM_ELABORACAO", "ATIVO", "CONCLUIDO", "SUSPENSO"] as const;
export const ROTULO_STATUS_PTI: Record<string, string> = {
  EM_ELABORACAO: "Em elaboração", ATIVO: "Ativo", CONCLUIDO: "Concluído", SUSPENSO: "Suspenso",
};

const dataOpt = z.string().optional().or(z.literal(""));

export const criarPtiSchema = z.object({
  pacienteId: z.string().min(1, "Selecione o paciente"),
  titulo: z.string().min(2, "Informe um título"),
  status: z.enum(STATUS_PTI).default("EM_ELABORACAO"),
  inicio: dataOpt,
  prazo: dataOpt,
});

export const editarPtiSchema = z.object({
  titulo: z.string().min(2).optional(),
  status: z.enum(STATUS_PTI).optional(),
  inicio: dataOpt,
  prazo: dataOpt,
});

export const objetivoSchema = z.object({
  descricao: z.string().min(1, "Descreva o objetivo"),
  meta: z.string().optional().or(z.literal("")),
  estrategias: z.string().optional().or(z.literal("")),
  responsavel: z.string().optional().or(z.literal("")),
  prazo: dataOpt,
  percentualExecucao: z.coerce.number().int().min(0).max(100).default(0),
});

export const reavaliacaoSchema = z.object({
  resumo: z.string().min(1, "Escreva o resumo da reavaliação"),
  indicadores: z.any().optional(),
});
