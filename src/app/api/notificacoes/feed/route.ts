import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";

export async function GET() {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const agora = new Date();
  const em24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
  const filtro = s.role !== "ADMIN" && s.unidadeId ? { unidadeId: s.unidadeId } : {};

  const proximos = await prisma.agendamento.findMany({
    where: { ...filtro, status: { in: ["AGENDADO", "CONFIRMADO"] }, inicio: { gte: agora, lte: em24h } },
    select: { id: true, inicio: true, tipo: true, paciente: { select: { nomeCompleto: true, nomeSocial: true } } },
    orderBy: { inicio: "asc" }, take: 20,
  });

  const itens = proximos.map((a) => ({
    id: a.id,
    titulo: `${(a.paciente.nomeSocial || a.paciente.nomeCompleto)} · ${a.tipo.toLowerCase()}`,
    quando: a.inicio.toISOString(),
  }));
  return NextResponse.json({ total: itens.length, itens });
}
