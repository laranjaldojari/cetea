import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarSenha } from "@/lib/auth/password";
import { criarSessao } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  }

  const { email, senha } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Resposta genérica para não revelar existência do e-mail
  if (!user || !user.ativo || !(await verificarSenha(senha, user.senhaHash))) {
    return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
  }

  await criarSessao({
    sub: user.id,
    role: user.role,
    instituicaoId: user.instituicaoId,
    unidadeId: user.unidadeId,
    nome: user.nome,
  });

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { ultimoLogin: new Date() } }),
    prisma.auditLog.create({
      data: { userId: user.id, acao: "LOGIN", entidade: "User", entidadeId: user.id },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
