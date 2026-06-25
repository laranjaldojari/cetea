import { z } from "zod";

export const TIPOS_REGISTRO = [
  "ANAMNESE", "AVALIACAO_MULTIPROFISSIONAL", "EVOLUCAO", "PARECER", "INTERCONSULTA",
  "ENCAMINHAMENTO", "RECEITA", "ATESTADO", "SOLICITACAO_EXAME",
] as const;

export const ROTULO_TIPO_REGISTRO: Record<string, string> = {
  ANAMNESE: "Anamnese",
  AVALIACAO_MULTIPROFISSIONAL: "Avaliação multiprofissional",
  EVOLUCAO: "Evolução",
  PARECER: "Parecer",
  INTERCONSULTA: "Interconsulta",
  ENCAMINHAMENTO: "Encaminhamento",
  RECEITA: "Receita médica",
  ATESTADO: "Atestado",
  SOLICITACAO_EXAME: "Solicitação de exames",
};

// Agrupamento para o seletor de tipo
export const GRUPOS_REGISTRO: { grupo: string; tipos: string[] }[] = [
  { grupo: "Registros clínicos", tipos: ["ANAMNESE", "AVALIACAO_MULTIPROFISSIONAL", "EVOLUCAO", "PARECER", "INTERCONSULTA"] },
  { grupo: "Documentos", tipos: ["RECEITA", "ATESTADO", "ENCAMINHAMENTO", "SOLICITACAO_EXAME"] },
];

// Tipos que usam formulário estruturado (campo `dados`)
export const TIPOS_ESTRUTURADOS = ["RECEITA", "ATESTADO", "SOLICITACAO_EXAME"] as const;
// Tipos que geram documento para impressão/entrega
export const TIPOS_DOCUMENTO = ["RECEITA", "ATESTADO", "ENCAMINHAMENTO", "SOLICITACAO_EXAME"] as const;

export const criarRegistroSchema = z.object({
  pacienteId: z.string().min(1, "Paciente é obrigatório"),
  tipo: z.enum(TIPOS_REGISTRO),
  conteudo: z.string().min(1, "Escreva o conteúdo do registro"),
  dados: z.any().optional(),
});

export const editarRegistroSchema = z.object({
  tipo: z.enum(TIPOS_REGISTRO).optional(),
  conteudo: z.string().min(1, "Escreva o conteúdo do registro"),
  dados: z.any().optional(),
});
