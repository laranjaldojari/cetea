import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, User, FileText, Activity, FolderArchive } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatarCPF, formatarData, idade } from "@/lib/utils";
import { hhmm } from "@/lib/date";
import { InativarButton } from "@/components/pacientes/InativarButton";

export const dynamic = "force-dynamic";

const ROTULO_NIVEL: Record<string, string> = { NIVEL_1: "Nível 1", NIVEL_2: "Nível 2", NIVEL_3: "Nível 3", NAO_AVALIADO: "Não avaliado" };
const ROTULO_STATUS: Record<string, string> = { ATIVO: "Ativo", INATIVO: "Inativo", FILA_ESPERA: "Fila de espera", ALTA: "Alta", TRANSFERIDO: "Transferido" };
const ROTULO_SEXO: Record<string, string> = { MASCULINO: "Masculino", FEMININO: "Feminino", INTERSEXO: "Intersexo", NAO_INFORMADO: "Não informado" };

function Linha({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0">
      <span className="text-ink-soft">{rotulo}</span>
      <span className="text-right font-medium">{valor || "—"}</span>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-surface p-4">
      <h2 className="mb-2 text-sm font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

export default async function FichaPacientePage({ params }: { params: { id: string } }) {
  const paciente = await prisma.paciente.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      responsaveis: true,
      comorbidades: true,
      agendamentos: { orderBy: { inicio: "desc" }, take: 10, include: { profissional: { select: { nome: true } } } },
    },
  });
  if (!paciente) notFound();

  const nome = paciente.nomeSocial || paciente.nomeCompleto;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/pacientes" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Pacientes</Link>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-brand/10 text-brand">
              {paciente.fotoUrl ? <img src={paciente.fotoUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{nome}</h1>
              <p className="text-sm text-ink-soft">{idade(paciente.dataNascimento)} anos · {ROTULO_STATUS[paciente.status]} · {ROTULO_NIVEL[paciente.nivelSuporte]}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/pacientes/${paciente.id}/documentos`} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-surface-2"><FolderArchive className="h-4 w-4" /> Documentos</Link>
          <Link href={`/pacientes/${paciente.id}/evolucao`} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-surface-2"><Activity className="h-4 w-4" /> Evoluções</Link>
          <Link href={`/pacientes/${paciente.id}/prontuario`} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-surface-2"><FileText className="h-4 w-4" /> Prontuário</Link>
          <Link href={`/pacientes/${paciente.id}/editar`} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"><Pencil className="h-4 w-4" /> Editar</Link>
          <InativarButton id={paciente.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Bloco titulo="Dados pessoais">
          <Linha rotulo="Nome completo" valor={paciente.nomeCompleto} />
          <Linha rotulo="CPF" valor={formatarCPF(paciente.cpf)} />
          <Linha rotulo="RG" valor={paciente.rg} />
          <Linha rotulo="CNS" valor={paciente.cns} />
          <Linha rotulo="Nascimento" valor={formatarData(paciente.dataNascimento)} />
          <Linha rotulo="Sexo" valor={ROTULO_SEXO[paciente.sexo]} />
        </Bloco>

        <Bloco titulo="Endereço e contato">
          <Linha rotulo="Endereço" valor={paciente.endereco} />
          <Linha rotulo="Município/UF" valor={[paciente.municipio, paciente.estado].filter(Boolean).join(" / ")} />
          <Linha rotulo="CEP" valor={paciente.cep} />
          <Linha rotulo="Telefones" valor={paciente.telefones.join(", ")} />
          <Linha rotulo="E-mail" valor={paciente.email} />
        </Bloco>

        <Bloco titulo="Dados clínicos">
          <Linha rotulo="Diagnóstico" valor={paciente.diagnosticoPrincipal} />
          <Linha rotulo="CID-10" valor={paciente.cid10} />
          <Linha rotulo="CID-11" valor={paciente.cid11} />
          <Linha rotulo="Data do diagnóstico" valor={formatarData(paciente.dataDiagnostico)} />
          <Linha rotulo="Médico responsável" valor={paciente.medicoResponsavel} />
          <Linha rotulo="Nível de suporte" valor={ROTULO_NIVEL[paciente.nivelSuporte]} />
        </Bloco>

        <Bloco titulo="Responsáveis">
          {paciente.responsaveis.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhum responsável cadastrado.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {paciente.responsaveis.map((r) => (
                <li key={r.id} className="rounded-lg bg-surface-2 p-2">
                  <p className="font-medium">{r.nome} {r.ehResponsavelLegal && <span className="text-xs text-brand">(legal)</span>}</p>
                  <p className="text-ink-soft">{[r.grauParentesco, r.telefone, r.email].filter(Boolean).join(" · ") || "—"}</p>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <Bloco titulo="Comorbidades">
          {paciente.comorbidades.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhuma comorbidade informada.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {paciente.comorbidades.map((c) => (
                <li key={c.id} className="flex justify-between border-b py-1 last:border-0">
                  <span>{c.descricao}{c.observacao ? ` — ${c.observacao}` : ""}</span>
                  <span className="text-ink-soft">{c.cid || ""}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <Bloco titulo="Últimos atendimentos">
          {paciente.agendamentos.length === 0 ? (
            <p className="text-sm text-ink-soft">Sem atendimentos registrados.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {paciente.agendamentos.map((a) => (
                <li key={a.id} className="flex justify-between border-b py-1 last:border-0">
                  <span>{formatarData(a.inicio)} {hhmm(new Date(a.inicio))} · {a.tipo.toLowerCase()}</span>
                  <span className="text-ink-soft">{a.profissional.nome} · {a.status.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      </div>
    </div>
  );
}
