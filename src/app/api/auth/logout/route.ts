import { NextResponse } from "next/server";
import { encerrarSessao, getSessao } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST() {
  const s = await getSessao();
  if (s) {
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "LOGOUT", entidade: "User", entidadeId: s.sub } });
  }
  encerrarSessao();
  return NextResponse.json({ ok: true });
}
