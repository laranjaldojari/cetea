import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getSessao } from "@/lib/auth/session";
import { gerenciaUsuarios } from "@/server/usuarios";
import { UsuarioForm } from "@/components/usuarios/UsuarioForm";
import { opcoesForm } from "../_opcoes";

export const dynamic = "force-dynamic";

export default async function NovoUsuarioPage() {
  const s = await getSessao();
  if (!s || !gerenciaUsuarios(s.role)) return <div className="rounded-xl border bg-surface p-8 text-center text-ink-soft">Acesso restrito.</div>;
  const { unidades, rolesDisponiveis, travarUnidade } = await opcoesForm(s);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link href="/usuarios" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Usuários</Link>
        <h1 className="text-xl font-semibold">Novo usuário</h1>
      </div>
      <UsuarioForm unidades={unidades} rolesDisponiveis={rolesDisponiveis} travarUnidade={travarUnidade} />
    </div>
  );
}
