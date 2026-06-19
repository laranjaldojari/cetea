"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

const TIPOS = ["LAUDO", "EXAME", "RELATORIO", "RECEITA", "ENCAMINHAMENTO", "OUTRO"];

export function UploadDocumento({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState("LAUDO");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar() {
    const file = ref.current?.files?.[0];
    if (!file) { setErro("Selecione um arquivo."); return; }
    setErro(""); setEnviando(true);
    const fd = new FormData();
    fd.append("file", file); fd.append("pacienteId", pacienteId); fd.append("tipo", tipo);
    const res = await fetch("/api/documentos", { method: "POST", body: fd });
    setEnviando(false);
    if (res.ok) { if (ref.current) ref.current.value = ""; router.refresh(); }
    else { const j = await res.json().catch(() => ({})); setErro(j.erro || "Falha no upload."); }
  }

  return (
    <div className="rounded-xl border bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm"><span className="text-ink-soft">Tipo</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="mt-1 block rounded-lg border bg-surface px-3 py-2 text-sm">
            {TIPOS.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
          </select></label>
        <label className="flex-1 text-sm"><span className="text-ink-soft">Arquivo (até 25 MB)</span>
          <input ref={ref} type="file" className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-white" /></label>
        <button onClick={enviar} disabled={enviando} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
          <Upload className="h-4 w-4" /> {enviando ? "Enviando…" : "Enviar"}
        </button>
      </div>
      <p className="mt-2 text-xs text-ink-soft">Enviar um arquivo com o mesmo nome cria uma nova versão automaticamente.</p>
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
