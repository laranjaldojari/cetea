import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarSenha } from "@/lib/auth/password";
import { assinarApiToken } from "@/lib/auth/apiToken";
import { limitar, ipDe } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const ip = ipDe(req);
  if (!limitar(`token:${ip}`, 10, 60_000).ok) return NextResponse.json({ erro: "Muitas tentativas" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const email = String(body?.email || ""), senha = String(body?.senha || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.ativo || !(await verificarSenha(senha, user.senhaHash))) {
    return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
  }
  const access_token = await assinarApiToken({ sub: user.id, role: user.role, instituicaoId: user.instituicaoId, unidadeId: user.unidadeId });
  return NextResponse.json({ access_token, token_type: "Bearer", expires_in: 3600 });
}
