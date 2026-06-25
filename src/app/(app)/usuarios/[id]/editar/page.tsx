import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { gerenciaUsuarios, podeGerenciarAlvo } from "@/server/usuarios";
import { UsuarioForm } from "@/components/usuarios/UsuarioForm";
import { opcoesForm } from "../../_opcoes";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s || !gerenciaUsuarios(s.role)) return <div className="rounded-xl border bg-surface p-8 text-center text-ink-soft">Acesso restrito.</div>;

  const usuario = await prisma.user.findFirst({ where: { id: params.id, deletedAt: null }, select: { id: true, nome: true, email: true, role: true, ativo: true, unidadeId: true } });
  if (!usuario) notFound();
  if (!podeGerenciarAlvo(s, usuario.role, usuario.unidadeId)) return <div className="rounded-xl border bg-surface p-8 text-center text-ink-soft">Você não pode gerenciar este usuário.</div>;

  const { unidades, rolesDisponiveis, travarUnidade } = await opcoesForm(s);
  // garante que o papel atual apareça na lista mesmo se não for atribuível pelo logado
  const roles = rolesDisponiveis.includes(usuario.role) ? rolesDisponiveis : [usuario.role, ...rolesDisponiveis];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link href="/usuarios" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Usuários</Link>
        <h1 className="text-xl font-semibold">{usuario.nome}</h1>
      </div>
      <UsuarioForm inicial={usuario} unidades={unidades} rolesDisponiveis={roles} travarUnidade={travarUnidade} ehProprio={s.sub === usuario.id} />
    </div>
  );
}
