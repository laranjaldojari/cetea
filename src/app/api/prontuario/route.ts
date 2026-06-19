import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { criarRegistroSchema } from "@/lib/validators/prontuario";

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = criarRegistroSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const registro = await prisma.registroProntuario.create({
    data: { pacienteId: parsed.data.pacienteId, autorId: s.sub, tipo: parsed.data.tipo, conteudo: parsed.data.conteudo },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "RegistroProntuario", entidadeId: registro.id } });
  return NextResponse.json({ registro }, { status: 201 });
}
