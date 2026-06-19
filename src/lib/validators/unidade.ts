import { z } from "zod";

export const unidadeSchema = z.object({
  nome: z.string().min(2, "Informe o nome da unidade"),
  cnes: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
  municipio: z.string().optional().or(z.literal("")),
  estado: z.string().length(2, "UF com 2 letras").optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  coordenador: z.string().optional().or(z.literal("")),
  horarioFuncionamento: z.string().optional().or(z.literal("")),
  // Recursos
  salasTerapeuticas: z.coerce.number().int().min(0).max(999).default(0),
  consultorios: z.coerce.number().int().min(0).max(999).default(0),
  espacoSensorial: z.boolean().default(false),
  salaIntegracao: z.boolean().default(false),
});
export type UnidadeInput = z.infer<typeof unidadeSchema>;
