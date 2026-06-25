import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { configuracoesSchema } from "@/lib/validators/configuracoes";

const naNulo = (v?: string) => (v && v.trim() !== "" ? v.trim() : null);

export async function PATCH(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (s.role !== "ADMIN") return NextResponse.json({ erro: "Apenas o administrador altera as configurações." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = configuracoesSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const instituicao = await prisma.instituicao.update({
    where: { id: s.instituicaoId },
    data: {
      nome: d.nome, sigla: naNulo(d.sigla), cnpj: naNulo(d.cnpj), cnes: naNulo(d.cnes),
      endereco: naNulo(d.endereco), telefone: naNulo(d.telefone), email: naNulo(d.email),
      site: naNulo(d.site), logoUrl: naNulo(d.logoUrl),
      corPrimaria: d.corPrimaria, corSecundaria: d.corSecundaria, corAcento: d.corAcento,
      duracaoPadraoMin: d.duracaoPadraoMin, horaAbertura: d.horaAbertura, horaFechamento: d.horaFechamento,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "Instituicao", entidadeId: instituicao.id } });
  return NextResponse.json({ instituicao });
}
