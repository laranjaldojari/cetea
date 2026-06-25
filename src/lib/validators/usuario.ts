import { z } from "zod";

export const ROLES = ["ADMIN", "COORDENADOR", "RECEPCAO", "PROFISSIONAL", "AUDITOR"] as const;
export const ROTULO_ROLE: Record<string, string> = {
  ADMIN: "Administrador Geral", COORDENADOR: "Coordenador", RECEPCAO: "Recepção",
  PROFISSIONAL: "Profissional", AUDITOR: "Auditor",
};
export const DESC_ROLE: Record<string, string> = {
  ADMIN: "Controle total do sistema",
  COORDENADOR: "Gerencia a própria unidade",
  RECEPCAO: "Agenda e cadastros",
  PROFISSIONAL: "Pacientes, prontuários e atendimentos",
  AUDITOR: "Somente leitura",
};

export const criarUsuarioSchema = z.object({
  nome: z.string().min(3, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
  role: z.enum(ROLES),
  unidadeId: z.string().optional().or(z.literal("")),
  ativo: z.boolean().default(true),
});

export const editarUsuarioSchema = z.object({
  nome: z.string().min(3).optional(),
  role: z.enum(ROLES).optional(),
  unidadeId: z.string().optional().or(z.literal("")),
  ativo: z.boolean().optional(),
  novaSenha: z.string().min(8, "A senha deve ter ao menos 8 caracteres").optional().or(z.literal("")),
});

export const trocarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual"),
  novaSenha: z.string().min(8, "A nova senha deve ter ao menos 8 caracteres"),
});
