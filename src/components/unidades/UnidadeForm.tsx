"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";

export function UnidadeForm({ inicial }: { inicial?: any }) {
  const router = useRouter();
  const ehEdicao = Boolean(inicial?.id);

  const [f, setF] = useState({
    nome: inicial?.nome ?? "",
    cnes: inicial?.cnes ?? "",
    endereco: inicial?.endereco ?? "",
    municipio: inicial?.municipio ?? "",
    estado: inicial?.estado ?? "",
    cep: inicial?.cep ?? "",
    telefone: inicial?.telefone ?? "",
    coordenador: inicial?.coordenador ?? "",
    horarioFuncionamento: inicial?.horarioFuncionamento ?? "",
    salasTerapeuticas: inicial?.salasTerapeuticas?.toString() ?? "0",
    consultorios: inicial?.consultorios?.toString() ?? "0",
    espacoSensorial: inicial?.espacoSensorial ?? false,
    salaIntegracao: inicial?.salaIntegracao ?? false,
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function salvar() {
    setErro(""); setSalvando(true);
    const payload = {
      ...f,
      salasTerapeuticas: Number(f.salasTerapeuticas) || 0,
      consultorios: Number(f.consultorios) || 0,
    };
    const url = ehEdicao ? `/api/unidades/${inicial.id}` : "/api/unidades";
    const res = await fetch(url, { method: ehEdicao ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSalvando(false);
    if (res.ok) { router.push("/unidades"); router.refresh(); return; }
    const j = await res.json().catch(() => ({}));
    setErro(j.erro || "Não foi possível salvar.");
  }

  async function inativar() {
    if (!confirm("Inativar esta unidade?")) return;
    const res = await fetch(`/api/unidades/${inicial.id}`, { method: "DELETE" });
    if (res.ok) { router.push("/unidades"); router.refresh(); }
    else { const j = await res.json().catch(() => ({})); setErro(j.erro || "Não foi possível inativar."); }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-surface p-4">
        <h2 className="mb-4 text-sm font-semibold">Identificação</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm md:col-span-2"><span className="text-ink-soft">Nome da unidade *</span>
            <input value={f.nome} onChange={(e) => set("nome", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">CNES</span>
            <input value={f.cnes} onChange={(e) => set("cnes", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">Coordenador</span>
            <input value={f.coordenador} onChange={(e) => set("coordenador", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm md:col-span-2"><span className="text-ink-soft">Endereço</span>
            <input value={f.endereco} onChange={(e) => set("endereco", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">Município</span>
            <input value={f.municipio} onChange={(e) => set("municipio", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">UF</span>
            <input value={f.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())} maxLength={2} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">CEP</span>
            <input value={f.cep} onChange={(e) => set("cep", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">Telefone</span>
            <input value={f.telefone} onChange={(e) => set("telefone", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm md:col-span-2"><span className="text-ink-soft">Horário de funcionamento</span>
            <input value={f.horarioFuncionamento} onChange={(e) => set("horarioFuncionamento", e.target.value)} className={inputCls} placeholder="ex.: Seg–Sex, 07h–19h" /></label>
        </div>
      </section>

      <section className="rounded-xl border bg-surface p-4">
        <h2 className="mb-4 text-sm font-semibold">Recursos disponíveis</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm"><span className="text-ink-soft">Salas terapêuticas</span>
            <input type="number" min={0} value={f.salasTerapeuticas} onChange={(e) => set("salasTerapeuticas", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">Consultórios</span>
            <input type="number" min={0} value={f.consultorios} onChange={(e) => set("consultorios", e.target.value)} className={inputCls} /></label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.espacoSensorial} onChange={(e) => set("espacoSensorial", e.target.checked)} /> Espaço sensorial
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.salaIntegracao} onChange={(e) => set("salaIntegracao", e.target.checked)} /> Sala de integração
          </label>
        </div>
      </section>

      {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}

      <div className="flex items-center justify-between">
        <div>
          {ehEdicao && (
            <button type="button" onClick={inativar} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-red-600 hover:bg-red-500/10">
              <Archive className="h-4 w-4" /> Inativar
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()} className="rounded-lg border px-4 py-2 text-sm hover:bg-surface-2">Cancelar</button>
          <button type="button" onClick={salvar} disabled={salvando} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
            {salvando ? "Salvando…" : ehEdicao ? "Salvar alterações" : "Cadastrar unidade"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
