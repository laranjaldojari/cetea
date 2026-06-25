"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { ROTULO_ROLE, DESC_ROLE } from "@/lib/validators/usuario";

interface Opcao { id: string; nome: string }

export function UsuarioForm({
  inicial, unidades, rolesDisponiveis, travarUnidade, ehProprio,
}: {
  inicial?: any;
  unidades: Opcao[];
  rolesDisponiveis: string[];
  travarUnidade: boolean;
  ehProprio?: boolean;
}) {
  const router = useRouter();
  const ehEdicao = Boolean(inicial?.id);
  const [f, setF] = useState({
    nome: inicial?.nome ?? "",
    email: inicial?.email ?? "",
    senha: "",
    role: inicial?.role ?? rolesDisponiveis[rolesDisponiveis.length - 1] ?? "RECEPCAO",
    unidadeId: inicial?.unidadeId ?? "",
    ativo: inicial?.ativo ?? true,
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function salvar() {
    setErro(""); setSalvando(true);
    const corpo: any = ehEdicao
      ? { nome: f.nome, role: f.role, ativo: f.ativo, ...(travarUnidade ? {} : { unidadeId: f.unidadeId }), ...(f.senha ? { novaSenha: f.senha } : {}) }
      : { nome: f.nome, email: f.email, senha: f.senha, role: f.role, ativo: f.ativo, ...(travarUnidade ? {} : { unidadeId: f.unidadeId }) };
    const url = ehEdicao ? `/api/usuarios/${inicial.id}` : "/api/usuarios";
    const res = await fetch(url, { method: ehEdicao ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
    setSalvando(false);
    if (res.ok) { router.push("/usuarios"); router.refresh(); return; }
    const j = await res.json().catch(() => ({}));
    setErro(j.erro || "Não foi possível salvar.");
  }

  async function desativar() {
    if (!confirm("Desativar este usuário? Ele perde o acesso ao sistema.")) return;
    const res = await fetch(`/api/usuarios/${inicial.id}`, { method: "DELETE" });
    if (res.ok) { router.push("/usuarios"); router.refresh(); }
    else { const j = await res.json().catch(() => ({})); setErro(j.erro || "Não foi possível desativar."); }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm md:col-span-2"><span className="text-ink-soft">Nome *</span>
            <input value={f.nome} onChange={(e) => set("nome", e.target.value)} className={inp} /></label>
          <label className="block text-sm"><span className="text-ink-soft">E-mail *</span>
            <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} disabled={ehEdicao} className={inp + (ehEdicao ? " opacity-60" : "")} placeholder="usuario@instituicao.gov.br" /></label>
          <label className="block text-sm"><span className="text-ink-soft">{ehEdicao ? "Nova senha (deixe em branco p/ manter)" : "Senha *"}</span>
            <input type="password" value={f.senha} onChange={(e) => set("senha", e.target.value)} className={inp} placeholder="mínimo 8 caracteres" /></label>

          <label className="block text-sm"><span className="text-ink-soft">Perfil de acesso *</span>
            <select value={f.role} onChange={(e) => set("role", e.target.value)} disabled={ehProprio} className={inp + (ehProprio ? " opacity-60" : "")}>
              {rolesDisponiveis.map((r) => <option key={r} value={r}>{ROTULO_ROLE[r]}</option>)}
            </select>
            <span className="mt-1 block text-xs text-ink-soft">{DESC_ROLE[f.role]}</span>
          </label>

          {!travarUnidade && (
            <label className="block text-sm"><span className="text-ink-soft">Unidade</span>
              <select value={f.unidadeId} onChange={(e) => set("unidadeId", e.target.value)} className={inp}>
                <option value="">—</option>
                {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select></label>
          )}

          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" checked={f.ativo} onChange={(e) => set("ativo", e.target.checked)} disabled={ehProprio} /> Acesso ativo
          </label>
        </div>
      </section>

      {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}

      <div className="flex items-center justify-between">
        <div>{ehEdicao && !ehProprio && (
          <button type="button" onClick={desativar} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-red-600 hover:bg-red-500/10"><Archive className="h-4 w-4" /> Desativar</button>
        )}</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()} className="rounded-lg border px-4 py-2 text-sm hover:bg-surface-2">Cancelar</button>
          <button type="button" onClick={salvar} disabled={salvando} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
            {salvando ? "Salvando…" : ehEdicao ? "Salvar" : "Criar usuário"}
          </button>
        </div>
      </div>
    </div>
  );
}
const inp = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
