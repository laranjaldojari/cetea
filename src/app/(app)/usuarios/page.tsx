import Link from "next/link";
import { Plus, KeyRound, UserCog } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { gerenciaUsuarios } from "@/server/usuarios";
import { ROTULO_ROLE } from "@/lib/validators/usuario";
import { formatarData } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const s = await getSessao();
  if (!s || !gerenciaUsuarios(s.role)) {
    return <div className="rounded-xl border bg-surface p-8 text-center text-ink-soft">Acesso restrito à administração e coordenação.</div>;
  }

  const usuarios = await prisma.user.findMany({
    where: { deletedAt: null, ...(s.role === "COORDENADOR" ? { unidadeId: s.unidadeId } : {}) },
    select: { id: true, nome: true, email: true, role: true, ativo: true, ultimoLogin: true, unidade: { select: { nome: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Usuários</h1>
          <p className="text-sm text-ink-soft">Controle de acesso ao sistema.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/conta" className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-surface-2"><KeyRound className="h-4 w-4" /> Minha senha</Link>
          <Link href="/usuarios/novo" className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"><Plus className="h-4 w-4" /> Novo usuário</Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b bg-surface-2 text-left text-ink-soft">
            <tr><th className="px-4 py-2.5 font-medium">Nome</th><th className="px-4 py-2.5 font-medium">E-mail</th><th className="px-4 py-2.5 font-medium">Perfil</th><th className="px-4 py-2.5 font-medium">Unidade</th><th className="px-4 py-2.5 font-medium">Situação</th><th className="px-4 py-2.5 font-medium">Último acesso</th></tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-surface-2">
                <td className="px-4 py-2.5"><Link href={`/usuarios/${u.id}/editar`} className="flex items-center gap-2 font-medium hover:text-brand"><UserCog className="h-4 w-4 text-ink-soft" />{u.nome}</Link></td>
                <td className="px-4 py-2.5 text-ink-soft">{u.email}</td>
                <td className="px-4 py-2.5">{ROTULO_ROLE[u.role] ?? u.role}</td>
                <td className="px-4 py-2.5 text-ink-soft">{u.unidade?.nome ?? "—"}</td>
                <td className="px-4 py-2.5">{u.ativo ? <span className="text-emerald-600">Ativo</span> : <span className="text-ink-soft">Inativo</span>}</td>
                <td className="px-4 py-2.5 text-ink-soft">{u.ultimoLogin ? formatarData(u.ultimoLogin) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
