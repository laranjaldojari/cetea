"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { SEXOS, STATUS_PACIENTE, NIVEIS_SUPORTE } from "@/lib/validators/paciente";

const ROTULO_SEXO: Record<string, string> = { MASCULINO: "Masculino", FEMININO: "Feminino", INTERSEXO: "Intersexo", NAO_INFORMADO: "Não informado" };
const ROTULO_STATUS: Record<string, string> = { ATIVO: "Ativo", INATIVO: "Inativo", FILA_ESPERA: "Fila de espera", ALTA: "Alta", TRANSFERIDO: "Transferido" };
const ROTULO_NIVEL: Record<string, string> = { NIVEL_1: "Nível 1 (apoio)", NIVEL_2: "Nível 2 (apoio substancial)", NIVEL_3: "Nível 3 (apoio muito substancial)", NAO_AVALIADO: "Não avaliado" };

interface Responsavel { nome: string; grauParentesco: string; ehResponsavelLegal: boolean; cpf: string; telefone: string; email: string; }
interface Comorbidade { descricao: string; cid: string; observacao: string; }

export interface PacienteInicial {
  id?: string;
  [k: string]: any;
}

const respVazio: Responsavel = { nome: "", grauParentesco: "", ehResponsavelLegal: false, cpf: "", telefone: "", email: "" };
const comVazia: Comorbidade = { descricao: "", cid: "", observacao: "" };

function dataParaInput(v?: string | Date | null) {
  if (!v) return "";
  return new Date(v).toISOString().slice(0, 10);
}

export function PacienteForm({ inicial }: { inicial?: PacienteInicial }) {
  const router = useRouter();
  const ehEdicao = Boolean(inicial?.id);

  const [f, setF] = useState({
    nomeCompleto: inicial?.nomeCompleto ?? "",
    nomeSocial: inicial?.nomeSocial ?? "",
    cpf: inicial?.cpf ?? "",
    rg: inicial?.rg ?? "",
    cns: inicial?.cns ?? "",
    dataNascimento: dataParaInput(inicial?.dataNascimento),
    sexo: inicial?.sexo ?? "NAO_INFORMADO",
    fotoUrl: inicial?.fotoUrl ?? "",
    endereco: inicial?.endereco ?? "",
    municipio: inicial?.municipio ?? "",
    estado: inicial?.estado ?? "",
    cep: inicial?.cep ?? "",
    email: inicial?.email ?? "",
    status: inicial?.status ?? "FILA_ESPERA",
    diagnosticoPrincipal: inicial?.diagnosticoPrincipal ?? "",
    cid10: inicial?.cid10 ?? "",
    cid11: inicial?.cid11 ?? "",
    dataDiagnostico: dataParaInput(inicial?.dataDiagnostico),
    medicoResponsavel: inicial?.medicoResponsavel ?? "",
    nivelSuporte: inicial?.nivelSuporte ?? "NAO_AVALIADO",
  });
  const [telefones, setTelefones] = useState<string[]>(inicial?.telefones?.length ? inicial.telefones : [""]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(
    inicial?.responsaveis?.length
      ? inicial.responsaveis.map((r: any) => ({ ...respVazio, ...r }))
      : [{ ...respVazio }],
  );
  const [comorbidades, setComorbidades] = useState<Comorbidade[]>(
    inicial?.comorbidades?.length ? inicial.comorbidades.map((c: any) => ({ ...comVazia, ...c })) : [],
  );
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));

  async function salvar() {
    setErro(""); setSalvando(true);
    const payload = {
      ...f,
      telefones: telefones.filter((t) => t.trim() !== ""),
      responsaveis: responsaveis.filter((r) => r.nome.trim() !== ""),
      comorbidades: comorbidades.filter((c) => c.descricao.trim() !== ""),
    };
    const url = ehEdicao ? `/api/pacientes/${inicial!.id}` : "/api/pacientes";
    const res = await fetch(url, {
      method: ehEdicao ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSalvando(false);
    if (res.ok) {
      const j = await res.json();
      router.push(`/pacientes/${j.paciente.id}`);
      router.refresh();
      return;
    }
    const j = await res.json().catch(() => ({}));
    setErro(j.erro || "Não foi possível salvar. Verifique os campos obrigatórios.");
  }

  return (
    <div className="space-y-6">
      {/* Dados pessoais */}
      <Secao titulo="Dados pessoais">
        <Campo label="Nome completo *" className="md:col-span-2">
          <input value={f.nomeCompleto} onChange={(e) => set("nomeCompleto", e.target.value)} className={inputCls} />
        </Campo>
        <Campo label="Nome social"><input value={f.nomeSocial} onChange={(e) => set("nomeSocial", e.target.value)} className={inputCls} /></Campo>
        <Campo label="CPF"><input value={f.cpf} onChange={(e) => set("cpf", e.target.value.replace(/\D/g, ""))} maxLength={11} className={inputCls} placeholder="somente números" /></Campo>
        <Campo label="RG"><input value={f.rg} onChange={(e) => set("rg", e.target.value)} className={inputCls} /></Campo>
        <Campo label="CNS (Cartão SUS)"><input value={f.cns} onChange={(e) => set("cns", e.target.value)} className={inputCls} /></Campo>
        <Campo label="Data de nascimento *"><input type="date" value={f.dataNascimento} onChange={(e) => set("dataNascimento", e.target.value)} className={inputCls} /></Campo>
        <Campo label="Sexo">
          <select value={f.sexo} onChange={(e) => set("sexo", e.target.value)} className={inputCls}>
            {SEXOS.map((s) => <option key={s} value={s}>{ROTULO_SEXO[s]}</option>)}
          </select>
        </Campo>
        <Campo label="Foto (URL)" className="md:col-span-2"><input value={f.fotoUrl} onChange={(e) => set("fotoUrl", e.target.value)} className={inputCls} placeholder="upload de arquivo virá na fase de documentos" /></Campo>
      </Secao>

      {/* Endereço e contato */}
      <Secao titulo="Endereço e contato">
        <Campo label="Endereço" className="md:col-span-2"><input value={f.endereco} onChange={(e) => set("endereco", e.target.value)} className={inputCls} /></Campo>
        <Campo label="Município"><input value={f.municipio} onChange={(e) => set("municipio", e.target.value)} className={inputCls} /></Campo>
        <Campo label="UF"><input value={f.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())} maxLength={2} className={inputCls} /></Campo>
        <Campo label="CEP"><input value={f.cep} onChange={(e) => set("cep", e.target.value)} className={inputCls} /></Campo>
        <Campo label="E-mail"><input value={f.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></Campo>
        <Campo label="Telefones" className="md:col-span-2">
          <div className="space-y-2">
            {telefones.map((t, i) => (
              <div key={i} className="flex gap-2">
                <input value={t} onChange={(e) => setTelefones((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} />
                <button type="button" onClick={() => setTelefones((arr) => arr.filter((_, j) => j !== i))} className="grid w-10 place-items-center rounded-lg border hover:bg-surface-2"><Trash2 className="h-4 w-4 text-ink-soft" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setTelefones((a) => [...a, ""])} className="flex items-center gap-1.5 text-sm text-brand hover:underline"><Plus className="h-4 w-4" /> Adicionar telefone</button>
          </div>
        </Campo>
      </Secao>

      {/* Responsáveis */}
      <Secao titulo="Responsáveis">
        <div className="md:col-span-2 space-y-4">
          {responsaveis.map((r, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo label="Nome"><input value={r.nome} onChange={(e) => mut(setResponsaveis, i, "nome", e.target.value)} className={inputCls} /></Campo>
                <Campo label="Grau de parentesco"><input value={r.grauParentesco} onChange={(e) => mut(setResponsaveis, i, "grauParentesco", e.target.value)} className={inputCls} placeholder="mãe, pai, avó…" /></Campo>
                <Campo label="CPF"><input value={r.cpf} onChange={(e) => mut(setResponsaveis, i, "cpf", e.target.value.replace(/\D/g, ""))} maxLength={11} className={inputCls} /></Campo>
                <Campo label="Telefone"><input value={r.telefone} onChange={(e) => mut(setResponsaveis, i, "telefone", e.target.value)} className={inputCls} /></Campo>
                <Campo label="E-mail"><input value={r.email} onChange={(e) => mut(setResponsaveis, i, "email", e.target.value)} className={inputCls} /></Campo>
                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                  <input type="checkbox" checked={r.ehResponsavelLegal} onChange={(e) => mut(setResponsaveis, i, "ehResponsavelLegal", e.target.checked)} />
                  Responsável legal
                </label>
              </div>
              <button type="button" onClick={() => setResponsaveis((a) => a.filter((_, j) => j !== i))} className="mt-2 flex items-center gap-1.5 text-sm text-red-600 hover:underline"><Trash2 className="h-4 w-4" /> Remover</button>
            </div>
          ))}
          <button type="button" onClick={() => setResponsaveis((a) => [...a, { ...respVazio }])} className="flex items-center gap-1.5 text-sm text-brand hover:underline"><Plus className="h-4 w-4" /> Adicionar responsável</button>
        </div>
      </Secao>

      {/* Dados clínicos */}
      <Secao titulo="Dados clínicos">
        <Campo label="Diagnóstico principal" className="md:col-span-2"><input value={f.diagnosticoPrincipal} onChange={(e) => set("diagnosticoPrincipal", e.target.value)} className={inputCls} /></Campo>
        <Campo label="CID-10"><input value={f.cid10} onChange={(e) => set("cid10", e.target.value)} className={inputCls} placeholder="ex.: F84.0" /></Campo>
        <Campo label="CID-11"><input value={f.cid11} onChange={(e) => set("cid11", e.target.value)} className={inputCls} placeholder="ex.: 6A02" /></Campo>
        <Campo label="Data do diagnóstico"><input type="date" value={f.dataDiagnostico} onChange={(e) => set("dataDiagnostico", e.target.value)} className={inputCls} /></Campo>
        <Campo label="Médico responsável"><input value={f.medicoResponsavel} onChange={(e) => set("medicoResponsavel", e.target.value)} className={inputCls} /></Campo>
        <Campo label="Nível de suporte (TEA)">
          <select value={f.nivelSuporte} onChange={(e) => set("nivelSuporte", e.target.value)} className={inputCls}>
            {NIVEIS_SUPORTE.map((n) => <option key={n} value={n}>{ROTULO_NIVEL[n]}</option>)}
          </select>
        </Campo>
        <Campo label="Situação">
          <select value={f.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
            {STATUS_PACIENTE.map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
          </select>
        </Campo>
      </Secao>

      {/* Comorbidades */}
      <Secao titulo="Comorbidades">
        <div className="md:col-span-2 space-y-4">
          {comorbidades.length === 0 && <p className="text-sm text-ink-soft">Nenhuma comorbidade informada.</p>}
          {comorbidades.map((c, i) => (
            <div key={i} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
              <Campo label="Descrição"><input value={c.descricao} onChange={(e) => mut(setComorbidades, i, "descricao", e.target.value)} className={inputCls} placeholder="TDAH, Epilepsia…" /></Campo>
              <Campo label="CID"><input value={c.cid} onChange={(e) => mut(setComorbidades, i, "cid", e.target.value)} className={inputCls} /></Campo>
              <Campo label="Observação"><input value={c.observacao} onChange={(e) => mut(setComorbidades, i, "observacao", e.target.value)} className={inputCls} /></Campo>
              <button type="button" onClick={() => setComorbidades((a) => a.filter((_, j) => j !== i))} className="flex items-center gap-1.5 text-sm text-red-600 hover:underline sm:col-span-3"><Trash2 className="h-4 w-4" /> Remover</button>
            </div>
          ))}
          <button type="button" onClick={() => setComorbidades((a) => [...a, { ...comVazia }])} className="flex items-center gap-1.5 text-sm text-brand hover:underline"><Plus className="h-4 w-4" /> Adicionar comorbidade</button>
        </div>
      </Secao>

      {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="rounded-lg border px-4 py-2 text-sm hover:bg-surface-2">Cancelar</button>
        <button type="button" onClick={salvar} disabled={salvando} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
          {salvando ? "Salvando…" : ehEdicao ? "Salvar alterações" : "Cadastrar paciente"}
        </button>
      </div>
    </div>
  );
}

const inputCls = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";

function mut<T>(setter: (fn: (a: T[]) => T[]) => void, i: number, k: string, v: any) {
  setter((arr) => arr.map((x: any, j) => (j === i ? { ...x, [k]: v } : x)));
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-surface p-4">
      <h2 className="mb-4 text-sm font-semibold">{titulo}</h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Campo({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
