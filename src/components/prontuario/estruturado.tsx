"use client";
import { Plus, Trash2 } from "lucide-react";

const inp = "w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";

export const VAZIO: Record<string, any> = {
  RECEITA: { medicamentos: [{ nome: "", apresentacao: "", posologia: "", quantidade: "" }], orientacoes: "" },
  ATESTADO: { finalidade: "", diasAfastamento: "", cid: "", observacoes: "" },
  SOLICITACAO_EXAME: { exames: [""], indicacao: "" },
};

/** Monta o texto oficial do registro a partir dos dados estruturados (texto = base do selo). */
export function comporConteudo(tipo: string, d: any): string {
  if (tipo === "RECEITA") {
    const meds = (d?.medicamentos ?? []).filter((m: any) => m?.nome?.trim());
    const linhas = meds.map((m: any, i: number) =>
      `${i + 1}) ${m.nome}${m.apresentacao ? " — " + m.apresentacao : ""}\n   ${m.posologia}${m.quantidade ? "   (Qtd: " + m.quantidade + ")" : ""}`);
    return "RECEITUÁRIO\n\n" + linhas.join("\n\n") + (d?.orientacoes ? "\n\nOrientações: " + d.orientacoes : "");
  }
  if (tipo === "ATESTADO") {
    let t = "ATESTADO\n\nAtesto, para os devidos fins, que o(a) paciente esteve sob meus cuidados nesta data";
    if (d?.diasAfastamento) t += `, necessitando de afastamento de suas atividades por ${d.diasAfastamento} dia(s)`;
    if (d?.finalidade) t += `, para fins de ${d.finalidade}`;
    t += ".";
    if (d?.cid) t += `\nCID: ${d.cid}`;
    if (d?.observacoes) t += `\n\n${d.observacoes}`;
    return t;
  }
  if (tipo === "SOLICITACAO_EXAME") {
    const ex = (d?.exames ?? []).filter((e: string) => e?.trim());
    return "SOLICITAÇÃO DE EXAMES\n\n" + ex.map((e: string, i: number) => `${i + 1}) ${e}`).join("\n") +
      (d?.indicacao ? `\n\nIndicação clínica: ${d.indicacao}` : "");
  }
  return "";
}

export function CamposEstruturados({ tipo, dados, setDados }: { tipo: string; dados: any; setDados: (d: any) => void }) {
  const d = dados ?? VAZIO[tipo] ?? {};
  const up = (patch: any) => setDados({ ...d, ...patch });

  if (tipo === "RECEITA") {
    const meds = d.medicamentos ?? [];
    const setMed = (i: number, patch: any) => up({ medicamentos: meds.map((m: any, j: number) => (j === i ? { ...m, ...patch } : m)) });
    return (
      <div className="space-y-3">
        {meds.map((m: any, i: number) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-ink-soft">Medicamento {i + 1}</span>
              {meds.length > 1 && <button type="button" onClick={() => up({ medicamentos: meds.filter((_: any, j: number) => j !== i) })} className="text-red-600 hover:opacity-70"><Trash2 className="h-4 w-4" /></button>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={m.nome} onChange={(e) => setMed(i, { nome: e.target.value })} placeholder="Medicamento *" className={inp} />
              <input value={m.apresentacao} onChange={(e) => setMed(i, { apresentacao: e.target.value })} placeholder="Apresentação (ex.: 500mg comp.)" className={inp} />
              <input value={m.posologia} onChange={(e) => setMed(i, { posologia: e.target.value })} placeholder="Posologia (ex.: 1 comp. de 8/8h por 7 dias) *" className={inp + " sm:col-span-2"} />
              <input value={m.quantidade} onChange={(e) => setMed(i, { quantidade: e.target.value })} placeholder="Quantidade (ex.: 1 caixa)" className={inp} />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => up({ medicamentos: [...meds, { nome: "", apresentacao: "", posologia: "", quantidade: "" }] })} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-surface-2"><Plus className="h-4 w-4" /> Adicionar medicamento</button>
        <label className="block text-sm"><span className="text-ink-soft">Orientações</span>
          <textarea value={d.orientacoes} onChange={(e) => up({ orientacoes: e.target.value })} rows={2} className={inp + " mt-1"} /></label>
      </div>
    );
  }

  if (tipo === "ATESTADO") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="text-ink-soft">Finalidade</span>
          <input value={d.finalidade} onChange={(e) => up({ finalidade: e.target.value })} placeholder="ex.: comparecimento, repouso" className={inp + " mt-1"} /></label>
        <label className="block text-sm"><span className="text-ink-soft">Dias de afastamento</span>
          <input type="number" min={0} value={d.diasAfastamento} onChange={(e) => up({ diasAfastamento: e.target.value })} className={inp + " mt-1"} /></label>
        <label className="block text-sm"><span className="text-ink-soft">CID (opcional)</span>
          <input value={d.cid} onChange={(e) => up({ cid: e.target.value })} className={inp + " mt-1"} /></label>
        <label className="block text-sm sm:col-span-2"><span className="text-ink-soft">Observações</span>
          <textarea value={d.observacoes} onChange={(e) => up({ observacoes: e.target.value })} rows={2} className={inp + " mt-1"} /></label>
      </div>
    );
  }

  if (tipo === "SOLICITACAO_EXAME") {
    const ex = d.exames ?? [""];
    const setEx = (i: number, v: string) => up({ exames: ex.map((x: string, j: number) => (j === i ? v : x)) });
    return (
      <div className="space-y-2">
        {ex.map((x: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input value={x} onChange={(e) => setEx(i, e.target.value)} placeholder={`Exame ${i + 1}`} className={inp} />
            {ex.length > 1 && <button type="button" onClick={() => up({ exames: ex.filter((_: string, j: number) => j !== i) })} className="grid w-9 shrink-0 place-items-center rounded-lg border text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>}
          </div>
        ))}
        <button type="button" onClick={() => up({ exames: [...ex, ""] })} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-surface-2"><Plus className="h-4 w-4" /> Adicionar exame</button>
        <label className="block text-sm"><span className="text-ink-soft">Indicação clínica / hipótese diagnóstica</span>
          <textarea value={d.indicacao} onChange={(e) => up({ indicacao: e.target.value })} rows={2} className={inp + " mt-1"} /></label>
      </div>
    );
  }
  return null;
}
