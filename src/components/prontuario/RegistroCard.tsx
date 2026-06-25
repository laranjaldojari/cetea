"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Pencil, Trash2, FileStack, PenLine, History, Printer } from "lucide-react";
import { ROTULO_TIPO_REGISTRO, TIPOS_ESTRUTURADOS, TIPOS_DOCUMENTO } from "@/lib/validators/prontuario";
import { CamposEstruturados, comporConteudo, VAZIO } from "./estruturado";
import { formatarData } from "@/lib/utils";

interface Registro {
  id: string; pacienteId: string; tipo: string; conteudo: string; dados: any; assinado: boolean;
  assinaturaHash: string | null; versao: number; versaoAnteriorId: string | null;
  autorNome: string; createdAt: string;
}

const estruturado = (t: string) => (TIPOS_ESTRUTURADOS as readonly string[]).includes(t);
const documento = (t: string) => (TIPOS_DOCUMENTO as readonly string[]).includes(t);

export function RegistroCard({ registro }: { registro: Registro }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [novaVersao, setNovaVersao] = useState(false);
  const [texto, setTexto] = useState(registro.conteudo);
  const [dados, setDados] = useState<any>(registro.dados ?? VAZIO[registro.tipo] ?? null);
  const [hist, setHist] = useState<any[] | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const recarregar = () => router.refresh();
  const corpo = () => (estruturado(registro.tipo) ? { conteudo: comporConteudo(registro.tipo, dados), dados } : { conteudo: texto });

  async function salvarEdicao() {
    setOcupado(true);
    const res = await fetch(`/api/prontuario/${registro.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo()) });
    setOcupado(false);
    if (res.ok) { setEditando(false); recarregar(); }
  }
  async function salvarNovaVersao() {
    setOcupado(true);
    const res = await fetch(`/api/prontuario/${registro.id}/nova-versao`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo()) });
    setOcupado(false);
    if (res.ok) { setNovaVersao(false); recarregar(); }
  }
  async function assinar() {
    if (!confirm("Assinar este registro? Após assinar, ele fica imutável.")) return;
    setOcupado(true);
    const res = await fetch(`/api/prontuario/${registro.id}/assinar`, { method: "POST" });
    setOcupado(false);
    if (res.ok) recarregar();
  }
  async function excluir() {
    if (!confirm("Excluir este rascunho?")) return;
    const res = await fetch(`/api/prontuario/${registro.id}`, { method: "DELETE" });
    if (res.ok) recarregar();
  }
  async function verHistorico() {
    if (hist) { setHist(null); return; }
    const res = await fetch(`/api/prontuario/${registro.id}/historico`);
    if (res.ok) { const j = await res.json(); setHist(j.historico); }
  }

  const Editor = () => (estruturado(registro.tipo)
    ? <CamposEstruturados tipo={registro.tipo} dados={dados} setDados={setDados} />
    : <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={7} className={ta} />);

  return (
    <article className="rounded-xl border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">{ROTULO_TIPO_REGISTRO[registro.tipo]}</span>
          <p className="mt-1 text-xs text-ink-soft">{registro.autorNome} · {formatarData(registro.createdAt)} · v{registro.versao}</p>
        </div>
        {registro.assinado ? (
          <span className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-600" title={`Selo: ${registro.assinaturaHash}`}><ShieldCheck className="h-3.5 w-3.5" /> Assinado</span>
        ) : (
          <span className="rounded-lg bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-600">Rascunho</span>
        )}
      </div>

      {editando ? (
        <div className="mt-3"><Editor /><div className="mt-2 flex gap-2"><button onClick={salvarEdicao} disabled={ocupado} className={btnPrim}>Salvar</button><button onClick={() => { setEditando(false); setTexto(registro.conteudo); setDados(registro.dados ?? VAZIO[registro.tipo]); }} className={btnSec}>Cancelar</button></div></div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm">{registro.conteudo}</p>
      )}

      {novaVersao && (
        <div className="mt-3 rounded-lg border border-brand/30 p-3">
          <p className="mb-2 text-xs font-medium text-brand">Nova versão (a anterior é preservada)</p>
          <Editor />
          <div className="mt-2 flex gap-2"><button onClick={salvarNovaVersao} disabled={ocupado} className={btnPrim}>Salvar nova versão</button><button onClick={() => { setNovaVersao(false); setTexto(registro.conteudo); setDados(registro.dados ?? VAZIO[registro.tipo]); }} className={btnSec}>Cancelar</button></div>
        </div>
      )}

      {hist && (
        <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">
          <p className="mb-2 text-xs font-medium text-ink-soft">Histórico de versões</p>
          <ul className="space-y-2">
            {hist.map((h) => (<li key={h.id} className="border-b pb-2 last:border-0"><p className="text-xs text-ink-soft">v{h.versao} · {h.autor} · {formatarData(h.createdAt)} {h.assinado ? "· assinado" : "· rascunho"}</p><p className="whitespace-pre-wrap">{h.conteudo}</p></li>))}
          </ul>
        </div>
      )}

      {!editando && !novaVersao && (
        <div className="mt-3 flex flex-wrap gap-2">
          {registro.assinado ? (
            <button onClick={() => { setDados(registro.dados ?? VAZIO[registro.tipo]); setTexto(registro.conteudo); setNovaVersao(true); }} className={btnSec}><FileStack className="h-4 w-4" /> Nova versão</button>
          ) : (
            <>
              <button onClick={() => setEditando(true)} className={btnSec}><Pencil className="h-4 w-4" /> Editar</button>
              <button onClick={assinar} disabled={ocupado} className={btnSec}><PenLine className="h-4 w-4" /> Assinar</button>
              <button onClick={excluir} className={btnDel}><Trash2 className="h-4 w-4" /> Excluir</button>
            </>
          )}
          {(documento(registro.tipo) || registro.assinado) && (
            <a href={`/pacientes/${registro.pacienteId}/prontuario/${registro.id}/imprimir`} target="_blank" rel="noopener" className={btnSec}><Printer className="h-4 w-4" /> Imprimir</a>
          )}
          {(registro.versao > 1 || registro.versaoAnteriorId) && (
            <button onClick={verHistorico} className={btnSec}><History className="h-4 w-4" /> {hist ? "Ocultar histórico" : "Histórico"}</button>
          )}
        </div>
      )}
    </article>
  );
}

const ta = "w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
const btnPrim = "rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60";
const btnSec = "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-surface-2";
const btnDel = "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-red-600 hover:bg-red-500/10";
