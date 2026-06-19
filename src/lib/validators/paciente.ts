import { z } from "zod";

export const SEXOS = ["MASCULINO", "FEMININO", "INTERSEXO", "NAO_INFORMADO"] as const;
export const STATUS_PACIENTE = ["ATIVO", "INATIVO", "FILA_ESPERA", "ALTA", "TRANSFERIDO"] as const;
export const NIVEIS_SUPORTE = ["NIVEL_1", "NIVEL_2", "NIVEL_3", "NAO_AVALIADO"] as const;

const vazioOuCpf = z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos").optional().or(z.literal(""));

export const responsavelSchema = z.object({
  nome: z.string().min(1, "Nome do responsável é obrigatório"),
  grauParentesco: z.string().optional().or(z.literal("")),
  ehResponsavelLegal: z.boolean().default(false),
  cpf: vazioOuCpf,
  telefone: z.string().optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
});

export const comorbidadeSchema = z.object({
  descricao: z.string().min(1, "Descreva a comorbidade"),
  cid: z.string().optional().or(z.literal("")),
  observacao: z.string().optional().or(z.literal("")),
});

export const pacienteSchema = z.object({
  // Dados pessoais
  nomeCompleto: z.string().min(3, "Informe o nome completo"),
  nomeSocial: z.string().optional().or(z.literal("")),
  cpf: vazioOuCpf,
  rg: z.string().optional().or(z.literal("")),
  cns: z.string().optional().or(z.literal("")),
  dataNascimento: z.string().refine((v) => !isNaN(Date.parse(v)), "Data de nascimento inválida"),
  sexo: z.enum(SEXOS).default("NAO_INFORMADO"),
  fotoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  // Endereço
  endereco: z.string().optional().or(z.literal("")),
  municipio: z.string().optional().or(z.literal("")),
  estado: z.string().length(2, "UF com 2 letras").optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  telefones: z.array(z.string()).default([]),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  // Status
  status: z.enum(STATUS_PACIENTE).default("FILA_ESPERA"),
  // Dados clínicos
  diagnosticoPrincipal: z.string().optional().or(z.literal("")),
  cid10: z.string().optional().or(z.literal("")),
  cid11: z.string().optional().or(z.literal("")),
  dataDiagnostico: z.string().optional().or(z.literal("")),
  medicoResponsavel: z.string().optional().or(z.literal("")),
  nivelSuporte: z.enum(NIVEIS_SUPORTE).default("NAO_AVALIADO"),
  unidadeId: z.string().optional().or(z.literal("")),
  // Aninhados
  responsaveis: z.array(responsavelSchema).default([]),
  comorbidades: z.array(comorbidadeSchema).default([]),
});
export type PacienteInput = z.infer<typeof pacienteSchema>;
