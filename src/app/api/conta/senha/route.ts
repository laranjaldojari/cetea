import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { hashSenha, verificarSenha } from "@/lib/auth/password";
import { trocarSenhaSchema } from "@/lib/validators/usuario";

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = trocarSenhaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: s.sub } });
  if (!user || !(await verificarSenha(parsed.data.senhaAtual, user.senhaHash))) {
    return NextResponse.json({ erro: "Senha atual incorreta." }, { status: 400 });
  }
  await prisma.user.update({ where: { id: s.sub }, data: { senhaHash: await hashSenha(parsed.data.novaSenha) } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "User", entidadeId: s.sub, diff: { acao: "trocar_senha" } } });
  return NextResponse.json({ ok: true });
}
