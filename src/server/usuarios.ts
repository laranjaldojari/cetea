interface Sessao { sub: string; role: string; unidadeId?: string | null }

export function gerenciaUsuarios(role: string): boolean {
  return role === "ADMIN" || role === "COORDENADOR";
}

/** Papéis que o usuário logado pode atribuir a outros. */
export function rolesAtribuiveis(role: string): string[] {
  if (role === "ADMIN") return ["ADMIN", "COORDENADOR", "RECEPCAO", "PROFISSIONAL", "AUDITOR"];
  if (role === "COORDENADOR") return ["RECEPCAO", "PROFISSIONAL", "AUDITOR"];
  return [];
}

/** O logado pode gerenciar um usuário-alvo com este papel/unidade? */
export function podeGerenciarAlvo(s: Sessao, alvoRole: string, alvoUnidadeId: string | null | undefined): boolean {
  if (s.role === "ADMIN") return true;
  if (s.role !== "COORDENADOR") return false;
  const mesmaUnidade = !alvoUnidadeId || alvoUnidadeId === s.unidadeId;
  return rolesAtribuiveis("COORDENADOR").includes(alvoRole) && mesmaUnidade;
}
