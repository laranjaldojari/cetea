import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever, podeAcessar } from "@/lib/rbac";
import { unidadeSchema } from "@/lib/validators/unidade";

const nuloSeVazio = (v?: string | null) => (v && v.trim() !== "" ? v : null);

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const unidade = await prisma.unidade.findFirst({ where: { id: params.id, deletedAt: null, instituicaoId: s.instituicaoId } });
  if (!unidade) return NextResponse.json({ erro: "Não encontrada" }, { status: 404 });
  return NextResponse.json({ unidade });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeAcessar(s.role, "unidades") || !podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = unidadeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  try {
    const unidade = await prisma.unidade.update({
      where: { id: params.id },
      data: {
        nome: d.nome, cnes: nuloSeVazio(d.cnes), endereco: nuloSeVazio(d.endereco),
        municipio: nuloSeVazio(d.municipio), estado: nuloSeVazio(d.estado), cep: nuloSeVazio(d.cep),
        telefone: nuloSeVazio(d.telefone), coordenador: nuloSeVazio(d.coordenador),
        horarioFuncionamento: nuloSeVazio(d.horarioFuncionamento),
        salasTerapeuticas: d.salasTerapeuticas, consultorios: d.consultorios,
        espacoSensorial: d.espacoSensorial, salaIntegracao: d.salaIntegracao,
      },
    });
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "Unidade", entidadeId: params.id } });
    return NextResponse.json({ unidade });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Já existe unidade com este CNES." }, { status: 409 });
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeAcessar(s.role, "unidades") || !podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  // Bloqueia inativação se houver vínculos ativos
  const [profs, pacs] = await Promise.all([
    prisma.profissional.count({ where: { unidadeId: params.id, deletedAt: null } }),
    prisma.paciente.count({ where: { unidadeId: params.id, deletedAt: null } }),
  ]);
  if (profs > 0 || pacs > 0) {
    return NextResponse.json({ erro: `Unidade possui ${profs} profissional(is) e ${pacs} paciente(s) vinculados.` }, { status: 409 });
  }
  await prisma.unidade.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "Unidade", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
