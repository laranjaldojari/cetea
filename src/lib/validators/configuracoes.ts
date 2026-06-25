import { z } from "zod";

const HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const opt = z.string().trim().optional().or(z.literal(""));

export const configuracoesSchema = z.object({
  nome: z.string().min(2, "Informe o nome da instituição"),
  sigla: opt,
  cnpj: opt,
  cnes: opt,
  endereco: opt,
  telefone: opt,
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  site: opt,
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  corPrimaria: z.string().regex(HEX, "Cor inválida"),
  corSecundaria: z.string().regex(HEX, "Cor inválida"),
  corAcento: z.string().regex(HEX, "Cor inválida"),
  duracaoPadraoMin: z.coerce.number().int().min(10).max(240),
  horaAbertura: z.string().regex(HHMM, "Hora inválida"),
  horaFechamento: z.string().regex(HHMM, "Hora inválida"),
});
export type ConfiguracoesInput = z.infer<typeof configuracoesSchema>;
