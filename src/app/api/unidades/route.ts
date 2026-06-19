import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever, podeAcessar } from "@/lib/rbac";
import { unidadeSchema } from "@/lib/validators/unidade";

const nuloSeVazio = (v?: string | null) => (v && v.trim() !== "" ? v : null);

export async function GET() {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const unidades = await prisma.unidade.findMany({
    where: { deletedAt: null, instituicaoId: s.instituicaoId },
    include: { _count: { select: { profissionais: true, pacientes: true } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json({ unidades });
}

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeAcessar(s.role, "unidades") || !podeEscrever(s.role)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = unidadeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  try {
    const unidade = await prisma.unidade.create({
      data: {
        nome: d.nome,
        cnes: nuloSeVazio(d.cnes),
        endereco: nuloSeVazio(d.endereco),
        municipio: nuloSeVazio(d.municipio),
        estado: nuloSeVazio(d.estado),
        cep: nuloSeVazio(d.cep),
        telefone: nuloSeVazio(d.telefone),
        coordenador: nuloSeVazio(d.coordenador),
        horarioFuncionamento: nuloSeVazio(d.horarioFuncionamento),
        salasTerapeuticas: d.salasTerapeuticas,
        consultorios: d.consultorios,
        espacoSensorial: d.espacoSensorial,
        salaIntegracao: d.salaIntegracao,
        instituicaoId: s.instituicaoId,
      },
    });
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "Unidade", entidadeId: unidade.id } });
    return NextResponse.json({ unidade }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Já existe unidade com este CNES." }, { status: 409 });
    throw e;
  }
}
