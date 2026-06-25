import { prisma } from "@/lib/db";

/** Converte "#0E7C86" em "14 124 134" para as variáveis CSS rgb(var(--brand)). */
export function hexParaRgb(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export async function getInstituicao(id: string) {
  return prisma.instituicao.findUnique({ where: { id } });
}
