import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth/session";
import { processarPendentes } from "@/server/notificacoes";

export async function POST(req: Request) {
  const segredo = req.headers.get("x-cron-secret");
  const cronOk = process.env.CRON_SECRET && segredo === process.env.CRON_SECRET;
  if (!cronOk) {
    const s = await getSessao();
    if (!s || (s.role !== "ADMIN" && s.role !== "COORDENADOR")) {
      return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
    }
  }
  const resultado = await processarPendentes();
  return NextResponse.json(resultado);
}
