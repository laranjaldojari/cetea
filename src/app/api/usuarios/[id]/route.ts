import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { hashSenha } from "@/lib/auth/password";
import { editarUsuarioSchema } from "@/lib/validators/usuario";
import { gerenciaUsuarios, podeGerenciarAlvo, rolesAtribuiveis } from "@/server/usuarios";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!gerenciaUsuarios(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const alvo = await prisma.user.findFirst({ where: { id: params.id, deletedAt: null }, select: { id: true, role: true, unidadeId: true } });
  if (!alvo) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  if (!podeGerenciarAlvo(s, alvo.role, alvo.unidadeId)) return NextResponse.json({ erro: "Fora do seu escopo de gestão." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = editarUsuarioSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;

  // Proteções: não desativar/rebaixar a si mesmo (evita travar o sistema)
  const ehProprio = s.sub === alvo.id;
  if (ehProprio && (d.ativo === false || (d.role && d.role !== alvo.role))) {
    return NextResponse.json({ erro: "Você não pode alterar o próprio perfil ou se desativar." }, { status: 400 });
  }
  // Novo papel deve ser atribuível pelo logado
  if (d.role && !rolesAtribuiveis(s.role).includes(d.role)) {
    return NextResponse.json({ erro: "Você não pode atribuir este perfil." }, { status: 403 });
  }
  // Coordenador não muda unidade para fora da própria
  const novaUnidade = s.role === "COORDENADOR" ? alvo.unidadeId : (d.unidadeId === undefined ? undefined : (d.unidadeId || null));

  const usuario = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(d.nome ? { nome: d.nome } : {}),
      ...(d.role ? { role: d.role as any } : {}),
      ...(d.ativo !== undefined ? { ativo: d.ativo } : {}),
      ...(novaUnidade !== undefined ? { unidadeId: novaUnidade } : {}),
      ...(d.novaSenha ? { senhaHash: await hashSenha(d.novaSenha) } : {}),
    },
    select: { id: true, nome: true, email: true, role: true, ativo: true },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "User", entidadeId: params.id } });
  return NextResponse.json({ usuario });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!gerenciaUsuarios(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  if (s.sub === params.id) return NextResponse.json({ erro: "Você não pode desativar a si mesmo." }, { status: 400 });

  const alvo = await prisma.user.findFirst({ where: { id: params.id, deletedAt: null }, select: { role: true, unidadeId: true } });
  if (!alvo) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  if (!podeGerenciarAlvo(s, alvo.role, alvo.unidadeId)) return NextResponse.json({ erro: "Fora do seu escopo de gestão." }, { status: 403 });

  await prisma.user.update({ where: { id: params.id }, data: { deletedAt: new Date(), ativo: false } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "User", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
