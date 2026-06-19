import type { UserRole } from "@prisma/client";

// Permissões por módulo. "*" = todos. Base para refinamento futuro.
export const PERMISSOES: Record<UserRole, { modulos: string[] | "*"; somenteLeitura: boolean }> = {
  ADMIN:        { modulos: "*", somenteLeitura: false },
  COORDENADOR:  { modulos: ["dashboard","pacientes","agenda","profissionais","unidades","prontuario","protocolos","pti","evolucao","relatorios","documentos"], somenteLeitura: false },
  RECEPCAO:     { modulos: ["dashboard","pacientes","agenda"], somenteLeitura: false },
  PROFISSIONAL: { modulos: ["dashboard","pacientes","prontuario","protocolos","pti","evolucao","relatorios","documentos","agenda"], somenteLeitura: false },
  AUDITOR:      { modulos: "*", somenteLeitura: true },
};

export function podeAcessar(role: UserRole, modulo: string): boolean {
  const p = PERMISSOES[role];
  return p.modulos === "*" || p.modulos.includes(modulo);
}

export function podeEscrever(role: UserRole): boolean {
  return !PERMISSOES[role].somenteLeitura;
}
