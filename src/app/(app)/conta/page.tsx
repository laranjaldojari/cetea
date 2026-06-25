import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { ROTULO_ROLE } from "@/lib/validators/usuario";
import { TrocarSenhaForm } from "@/components/usuarios/TrocarSenhaForm";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const s = await getSessao();
  if (!s) return null;
  const user = await prisma.user.findUnique({ where: { id: s.sub }, select: { nome: true, email: true, role: true, unidade: { select: { nome: true } } } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Minha conta</h1>
        <p className="text-sm text-ink-soft">Seus dados de acesso e senha.</p>
      </div>
      <section className="rounded-xl border bg-surface p-4 text-sm">
        <dl className="grid gap-2 sm:grid-cols-2">
          <div><dt className="text-ink-soft">Nome</dt><dd className="font-medium">{user?.nome}</dd></div>
          <div><dt className="text-ink-soft">E-mail</dt><dd className="font-medium">{user?.email}</dd></div>
          <div><dt className="text-ink-soft">Perfil</dt><dd className="font-medium">{ROTULO_ROLE[user?.role ?? ""] ?? user?.role}</dd></div>
          <div><dt className="text-ink-soft">Unidade</dt><dd className="font-medium">{user?.unidade?.nome ?? "—"}</dd></div>
        </dl>
      </section>
      <div>
        <h2 className="mb-2 text-sm font-semibold">Alterar senha</h2>
        <TrocarSenhaForm />
      </div>
    </div>
  );
}
