"use client";
import { useState } from "react";

export function TrocarSenhaForm() {
  const [f, setF] = useState({ senhaAtual: "", novaSenha: "", confirmar: "" });
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setMsg(null);
    if (f.novaSenha.length < 8) { setMsg({ ok: false, texto: "A nova senha deve ter ao menos 8 caracteres." }); return; }
    if (f.novaSenha !== f.confirmar) { setMsg({ ok: false, texto: "A confirmação não confere." }); return; }
    setSalvando(true);
    const res = await fetch("/api/conta/senha", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senhaAtual: f.senhaAtual, novaSenha: f.novaSenha }) });
    setSalvando(false);
    if (res.ok) { setMsg({ ok: true, texto: "Senha alterada com sucesso." }); setF({ senhaAtual: "", novaSenha: "", confirmar: "" }); }
    else { const j = await res.json().catch(() => ({})); setMsg({ ok: false, texto: j.erro || "Não foi possível alterar." }); }
  }

  return (
    <div className="rounded-xl border bg-surface p-4 space-y-3 max-w-md">
      <label className="block text-sm"><span className="text-ink-soft">Senha atual</span>
        <input type="password" value={f.senhaAtual} onChange={(e) => setF({ ...f, senhaAtual: e.target.value })} className={inp} /></label>
      <label className="block text-sm"><span className="text-ink-soft">Nova senha</span>
        <input type="password" value={f.novaSenha} onChange={(e) => setF({ ...f, novaSenha: e.target.value })} className={inp} placeholder="mínimo 8 caracteres" /></label>
      <label className="block text-sm"><span className="text-ink-soft">Confirmar nova senha</span>
        <input type="password" value={f.confirmar} onChange={(e) => setF({ ...f, confirmar: e.target.value })} className={inp} /></label>
      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.texto}</p>}
      <button onClick={salvar} disabled={salvando} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">{salvando ? "Salvando…" : "Alterar senha"}</button>
    </div>
  );
}
const inp = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
