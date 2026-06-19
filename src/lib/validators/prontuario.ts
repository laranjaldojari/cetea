import { z } from "zod";

export const TIPOS_REGISTRO = [
  "ANAMNESE", "AVALIACAO_MULTIPROFISSIONAL", "EVOLUCAO", "PARECER", "ENCAMINHAMENTO", "INTERCONSULTA",
] as const;

export const ROTULO_TIPO_REGISTRO: Record<string, string> = {
  ANAMNESE: "Anamnese",
  AVALIACAO_MULTIPROFISSIONAL: "Avaliação multiprofissional",
  EVOLUCAO: "Evolução",
  PARECER: "Parecer",
  ENCAMINHAMENTO: "Encaminhamento",
  INTERCONSULTA: "Interconsulta",
};

export const criarRegistroSchema = z.object({
  pacienteId: z.string().min(1, "Paciente é obrigatório"),
  tipo: z.enum(TIPOS_REGISTRO),
  conteudo: z.string().min(1, "Escreva o conteúdo do registro"),
});

export const editarRegistroSchema = z.object({
  tipo: z.enum(TIPOS_REGISTRO).optional(),
  conteudo: z.string().min(1, "Escreva o conteúdo do registro"),
});
