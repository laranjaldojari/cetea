import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guardaApi } from "@/lib/apiGuard";

export async function GET(req: Request) {
  const g = await guardaApi(req);
  if ("resposta" in g) return g.resposta;
  const { searchParams } = new URL(req.url);
  const inicio = searchParams.get("inicio"), fim = searchParams.get("fim");
  const filtro = g.payload.role !== "ADMIN" && g.payload.unidadeId ? { unidadeId: g.payload.unidadeId } : {};

  const dados = await prisma.agendamento.findMany({
    where: { ...filtro, ...(inicio || fim ? { inicio: { ...(inicio ? { gte: new Date(inicio) } : {}), ...(fim ? { lte: new Date(fim) } : {}) } } : {}) },
    select: { id: true, pacienteId: true, profissionalId: true, unidadeId: true, tipo: true, status: true, inicio: true, fim: true },
    orderBy: { inicio: "asc" }, take: 200,
  });
  return NextResponse.json({ total: dados.length, dados });
}
