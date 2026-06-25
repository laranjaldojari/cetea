import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { hashSenha } from "@/lib/auth/password";
import { criarUsuarioSchema } from "@/lib/validators/usuario";
import { gerenciaUsuarios, podeGerenciarAlvo, rolesAtribuiveis as rolesPermitidos } from "@/server/usuarios";

export async function GET() {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!gerenciaUsuarios(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const usuarios = await prisma.user.findMany({
    where: { deletedAt: null, ...(s.role === "COORDENADOR" ? { unidadeId: s.unidadeId } : {}) },
    select: { id: true, nome: true, email: true, role: true, ativo: true, ultimoLogin: true, unidadeId: true, unidade: { select: { nome: true } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json({ usuarios });
}

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!gerenciaUsuarios(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = criarUsuarioSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  // Coordenador: papel deve ser atribuível e unidade forçada à própria
  const unidadeAlvo = s.role === "COORDENADOR" ? (s.unidadeId ?? null) : (d.unidadeId || s.unidadeId || null);
  if (!rolesPermitidos(s.role).includes(d.role)) {
    return NextResponse.json({ erro: "Você não pode atribuir este perfil." }, { status: 403 });
  }
  if (!podeGerenciarAlvo(s, d.role, unidadeAlvo)) {
    return NextResponse.json({ erro: "Fora do seu escopo de gestão." }, { status: 403 });
  }

  try {
    const usuario = await prisma.user.create({
      data: {
        nome: d.nome, email: d.email.toLowerCase(), senhaHash: await hashSenha(d.senha),
        role: d.role as any, ativo: d.ativo, instituicaoId: s.instituicaoId, unidadeId: unidadeAlvo,
      },
      select: { id: true, nome: true, email: true, role: true },
    });
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "User", entidadeId: usuario.id } });
    return NextResponse.json({ usuario }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Já existe um usuário com este e-mail." }, { status: 409 });
    throw e;
  }
}
