import { createHash } from "crypto";
import { prisma } from "@/lib/db";

/**
 * Selo de integridade do registro: SHA-256 sobre conteúdo + autor + instante.
 * Permite detectar qualquer alteração posterior. NÃO substitui assinatura
 * digital ICP-Brasil (certificado), que é uma evolução futura.
 */
export function gerarSelo(params: { conteudo: string; autorId: string; quando: Date }) {
  return createHash("sha256")
    .update(`${params.conteudo}|${params.autorId}|${params.quando.toISOString()}`)
    .digest("hex");
}

/** Caminha a cadeia de versões anteriores (mais nova → mais antiga). */
export async function historicoVersoes(registroId: string) {
  const historico: any[] = [];
  let atualId: string | null = registroId;
  // limite de segurança contra ciclos
  for (let i = 0; i < 100 && atualId; i++) {
    const r: any = await prisma.registroProntuario.findUnique({
      where: { id: atualId },
      include: { autor: { select: { nome: true } } },
    });
    if (!r) break;
    historico.push(r);
    atualId = r.versaoAnteriorId;
  }
  return historico;
}
