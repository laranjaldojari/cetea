"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Building2 } from "lucide-react";

const inp = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
const lbl = "block text-sm";

export function ConfiguracoesForm({ inicial }: { inicial: any }) {
  const router = useRouter();
  const [f, setF] = useState({
    nome: inicial.nome ?? "", sigla: inicial.sigla ?? "", cnpj: inicial.cnpj ?? "", cnes: inicial.cnes ?? "",
    endereco: inicial.endereco ?? "", telefone: inicial.telefone ?? "", email: inicial.email ?? "", site: inicial.site ?? "",
    logoUrl: inicial.logoUrl ?? "",
    corPrimaria: inicial.corPrimaria ?? "#0E7C86", corSecundaria: inicial.corSecundaria ?? "#0B5563", corAcento: inicial.corAcento ?? "#F59E0B",
    duracaoPadraoMin: inicial.duracaoPadraoMin ?? 50, horaAbertura: inicial.horaAbertura ?? "08:00", horaFechamento: inicial.horaFechamento ?? "18:00",
  });
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function salvar() {
    setMsg(null); setSalvando(true);
    const res = await fetch("/api/configuracoes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setSalvando(false);
    if (res.ok) { setMsg({ ok: true, texto: "Configurações salvas. O tema foi aplicado." }); router.refresh(); }
    else { const j = await res.json().catch(() => ({})); setMsg({ ok: false, texto: j.erro || "Não foi possível salvar." }); }
  }

  return (
    <div className="space-y-6">
      {/* Identidade */}
      <section className="rounded-xl border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Identidade da instituição</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={lbl}><span className="text-ink-soft">Nome *</span><input value={f.nome} onChange={(e) => set("nome", e.target.value)} className={inp} /></label>
          <label className={lbl}><span className="text-ink-soft">Sigla</span><input value={f.sigla} onChange={(e) => set("sigla", e.target.value)} className={inp} placeholder="CETEA" /></label>
          <label className={lbl}><span className="text-ink-soft">CNPJ</span><input value={f.cnpj} onChange={(e) => set("cnpj", e.target.value)} className={inp} /></label>
          <label className={lbl}><span className="text-ink-soft">CNES</span><input value={f.cnes} onChange={(e) => set("cnes", e.target.value)} className={inp} /></label>
          <label className={lbl + " md:col-span-2"}><span className="text-ink-soft">Endereço</span><input value={f.endereco} onChange={(e) => set("endereco", e.target.value)} className={inp} /></label>
          <label className={lbl}><span className="text-ink-soft">Telefone</span><input value={f.telefone} onChange={(e) => set("telefone", e.target.value)} className={inp} /></label>
          <label className={lbl}><span className="text-ink-soft">E-mail</span><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={inp} /></label>
          <label className={lbl + " md:col-span-2"}><span className="text-ink-soft">Site</span><input value={f.site} onChange={(e) => set("site", e.target.value)} className={inp} placeholder="https://" /></label>
        </div>
      </section>

      {/* Aparência */}
      <section className="rounded-xl border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Aparência (white-label)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className={lbl + " md:col-span-2"}><span className="text-ink-soft">URL do logotipo</span><input value={f.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} className={inp} placeholder="https://.../logo.png" /></label>
            {([["corPrimaria", "Cor primária"], ["corSecundaria", "Cor secundária"], ["corAcento", "Cor de destaque"]] as const).map(([k, rotulo]) => (
              <label key={k} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{rotulo}</span>
                <span className="flex items-center gap-2">
                  <input type="color" value={(f as any)[k]} onChange={(e) => set(k, e.target.value)} className="h-8 w-12 cursor-pointer rounded border bg-surface" />
                  <code className="text-xs">{(f as any)[k]}</code>
                </span>
              </label>
            ))}
          </div>
          {/* Pré-visualização */}
          <div className="rounded-lg border p-3" style={{ ["--brand" as any]: hexRgb(f.corPrimaria), ["--brand-dark" as any]: hexRgb(f.corSecundaria), ["--brand-accent" as any]: hexRgb(f.corAcento) }}>
            <p className="mb-2 text-xs text-ink-soft">Pré-visualização</p>
            <div className="flex items-center gap-2">
              {f.logoUrl ? <img src={f.logoUrl} alt="" className="h-6 w-6 rounded object-contain" /> : <Building2 className="h-6 w-6" style={{ color: f.corPrimaria }} />}
              <span className="font-semibold" style={{ color: f.corPrimaria }}>{f.sigla || f.nome || "Instituição"}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ background: f.corPrimaria }}>Botão</span>
              <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ background: f.corAcento }}>Destaque</span>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda */}
      <section className="rounded-xl border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Parâmetros de agenda</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <label className={lbl}><span className="text-ink-soft">Duração padrão (min)</span><input type="number" min={10} max={240} value={f.duracaoPadraoMin} onChange={(e) => set("duracaoPadraoMin", e.target.value)} className={inp} /></label>
          <label className={lbl}><span className="text-ink-soft">Abertura</span><input type="time" value={f.horaAbertura} onChange={(e) => set("horaAbertura", e.target.value)} className={inp} /></label>
          <label className={lbl}><span className="text-ink-soft">Fechamento</span><input type="time" value={f.horaFechamento} onChange={(e) => set("horaFechamento", e.target.value)} className={inp} /></label>
        </div>
      </section>

      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.texto}</p>}
      <div className="flex justify-end">
        <button onClick={salvar} disabled={salvando} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
          <Save className="h-4 w-4" /> {salvando ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}

function hexRgb(hex: string): string {
  let h = (hex || "").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return "14 124 134";
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
