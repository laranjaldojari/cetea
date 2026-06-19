"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { pontuar, type DefinicaoProtocolo, type Respostas } from "@/server/protocolos";

interface Opcao { id: string; nome: string }

export function AplicarForm({
  protocoloId, definicao, pacientes, aplicacaoId, pacienteIdInicial, respostasIniciais,
}: {
  protocoloId: string;
  definicao: DefinicaoProtocolo;
  pacientes: Opcao[];
  aplicacaoId?: string;
  pacienteIdInicial?: string;
  respostasIniciais?: Respostas;
}) {
  const router = useRouter();
  const ehEdicao = Boolean(aplicacaoId);
  const [pacienteId, setPacienteId] = useState(pacienteIdInicial ?? "");
  const [respostas, setRespostas] = useState<Respostas>(respostasIniciais ?? {});
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const resultado = useMemo(() => pontuar(definicao, respostas), [definicao, respostas]);
  const setResp = (id: string, v: string | number | boolean) => setRespostas((r) => ({ ...r, [id]: v }));

  async function salvar() {
    if (!pacienteId) { setErro("Selecione o paciente."); return; }
    setErro(""); setSalvando(true);
    const url = ehEdicao ? `/api/protocolos/aplicacoes/${aplicacaoId}` : `/api/protocolos/${protocoloId}/aplicar`;
    const res = await fetch(url, {
      method: ehEdicao ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pacienteId, respostas }),
    });
    setSalvando(false);
    if (res.ok) {
      const j = await res.json();
      router.push(`/protocolos/aplicacao/${j.aplicacao.id}`);
      router.refresh();
      return;
    }
    setErro("Não foi possível salvar a avaliação.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {/* Itens */}
      <div className="space-y-4">
        {definicao.itensExemplo && (
          <div className="flex gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{definicao.notaLicenca || "Itens de exemplo — carregue o texto oficial licenciado antes do uso clínico."}</span>
          </div>
        )}

        <div className="rounded-xl border bg-surface p-4">
          <label className="block text-sm">
            <span className="text-ink-soft">Paciente *</span>
            <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} disabled={ehEdicao}
              className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand disabled:opacity-60">
              <option value="">Selecione…</option>
              {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>
          {definicao.instrucoes && <p className="mt-3 text-sm text-ink-soft">{definicao.instrucoes}</p>}
        </div>

        <ol className="space-y-2">
          {definicao.itens.map((item, idx) => (
            <li key={item.id} className="rounded-xl border bg-surface p-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 w-6 shrink-0 text-ink-soft tabular-nums">{idx + 1}.</span>
                <div className="flex-1">
                  <p>{item.texto}{item.reverso && <span className="ml-1 text-xs text-ink-soft">(invertido)</span>}</p>
                  <div className="mt-2">
                    {definicao.tipoResposta === "ESCALA" ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(definicao.opcoes ?? []).map((o) => (
                          <button key={o.valor} type="button" onClick={() => setResp(item.id, o.valor)}
                            className={btn(respostas[item.id] === o.valor)}>{o.rotulo}</button>
                        ))}
                      </div>
                    ) : definicao.tipoResposta === "PRESENCA" ? (
                      <button type="button" onClick={() => setResp(item.id, !respostas[item.id])}
                        className={btn(Boolean(respostas[item.id]))}>
                        {respostas[item.id] ? "Presente" : "Marcar presente"}
                      </button>
                    ) : (
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setResp(item.id, "SIM")} className={btn(respostas[item.id] === "SIM")}>Sim</button>
                        <button type="button" onClick={() => setResp(item.id, "NAO")} className={btn(respostas[item.id] === "NAO")}>Não</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Resultado ao vivo */}
      <aside className="space-y-4 lg:sticky lg:top-4 self-start">
        <div className="rounded-xl border bg-surface p-4">
          <h3 className="text-sm font-semibold">Resultado</h3>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{resultado.pontuacaoTotal}</p>
          <p className="text-sm text-ink-soft">pontos</p>
          <p className="mt-3 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand">{resultado.classificacao}</p>
          <p className="mt-2 text-xs text-ink-soft">{resultado.respondidos}/{resultado.totalItens} itens respondidos</p>

          {resultado.subescalas && (
            <ul className="mt-3 space-y-1 text-sm">
              {resultado.subescalas.map((sub) => (
                <li key={sub.nome} className="flex justify-between border-t py-1">
                  <span className="text-ink-soft">{sub.nome}</span>
                  <span className="tabular-nums">{sub.soma} (méd. {sub.media})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <div className="flex flex-col gap-2">
          <button type="button" onClick={salvar} disabled={salvando}
            className="rounded-lg bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
            {salvando ? "Salvando…" : ehEdicao ? "Salvar alterações" : "Concluir avaliação"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-lg border py-2.5 text-sm hover:bg-surface-2">Cancelar</button>
        </div>
      </aside>
    </div>
  );
}

const btn = (ativo: boolean) =>
  `rounded-lg border px-3 py-1.5 text-sm ${ativo ? "border-brand bg-brand text-white" : "hover:bg-surface-2"}`;
