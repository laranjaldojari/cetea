import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { lerArquivo } from "@/server/storage";
import { unidadeOk } from "@/lib/escopo";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const doc = await prisma.documento.findFirst({ where: { id: params.id, deletedAt: null }, include: { paciente: { select: { unidadeId: true } } } });
  if (!doc) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  if (s.role !== "ADMIN" && !(doc.paciente && unidadeOk(s, doc.paciente.unidadeId))) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  }

  try {
    const buffer = await lerArquivo(doc.url);
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "VIEW", entidade: "Documento", entidadeId: doc.id } });
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.nome)}"`,
      },
    });
  } catch {
    return NextResponse.json({ erro: "Arquivo indisponível no armazenamento" }, { status: 404 });
  }
}
