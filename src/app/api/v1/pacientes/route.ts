import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guardaApi } from "@/lib/apiGuard";

export async function GET(req: Request) {
  const g = await guardaApi(req);
  if ("resposta" in g) return g.resposta;
  const { searchParams } = new URL(req.url);
  const pagina = Math.max(1, Number(searchParams.get("pagina") || 1));
  const tamanho = Math.min(100, Math.max(1, Number(searchParams.get("tamanho") || 50)));
  const filtro = g.payload.role !== "ADMIN" && g.payload.unidadeId ? { unidadeId: g.payload.unidadeId } : {};

  const [total, dados] = await Promise.all([
    prisma.paciente.count({ where: { deletedAt: null, ...filtro } }),
    prisma.paciente.findMany({
      where: { deletedAt: null, ...filtro },
      select: { id: true, nomeCompleto: true, cns: true, dataNascimento: true, sexo: true, status: true, nivelSuporte: true, cid10: true, municipio: true, estado: true },
      orderBy: { nomeCompleto: "asc" }, skip: (pagina - 1) * tamanho, take: tamanho,
    }),
  ]);
  return NextResponse.json({ pagina, tamanho, total, dados });
}
