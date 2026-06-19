import type { PacienteInput } from "@/lib/validators/paciente";

const nuloSeVazio = (v?: string | null) => (v && v.trim() !== "" ? v : null);

/** Converte o input validado nos dados escalares do Paciente. */
export function dadosEscalares(d: PacienteInput) {
  return {
    nomeCompleto: d.nomeCompleto,
    nomeSocial: nuloSeVazio(d.nomeSocial),
    cpf: nuloSeVazio(d.cpf),
    rg: nuloSeVazio(d.rg),
    cns: nuloSeVazio(d.cns),
    dataNascimento: new Date(d.dataNascimento),
    sexo: d.sexo,
    fotoUrl: nuloSeVazio(d.fotoUrl),
    endereco: nuloSeVazio(d.endereco),
    municipio: nuloSeVazio(d.municipio),
    estado: nuloSeVazio(d.estado),
    cep: nuloSeVazio(d.cep),
    telefones: d.telefones.filter((t) => t.trim() !== ""),
    email: nuloSeVazio(d.email),
    status: d.status,
    diagnosticoPrincipal: nuloSeVazio(d.diagnosticoPrincipal),
    cid10: nuloSeVazio(d.cid10),
    cid11: nuloSeVazio(d.cid11),
    dataDiagnostico: d.dataDiagnostico ? new Date(d.dataDiagnostico) : null,
    medicoResponsavel: nuloSeVazio(d.medicoResponsavel),
    nivelSuporte: d.nivelSuporte,
  };
}

export const dadosResponsaveis = (d: PacienteInput) =>
  d.responsaveis.map((r) => ({
    nome: r.nome,
    grauParentesco: nuloSeVazio(r.grauParentesco),
    ehResponsavelLegal: r.ehResponsavelLegal,
    cpf: nuloSeVazio(r.cpf),
    telefone: nuloSeVazio(r.telefone),
    email: nuloSeVazio(r.email),
  }));

export const dadosComorbidades = (d: PacienteInput) =>
  d.comorbidades.map((c) => ({
    descricao: c.descricao,
    cid: nuloSeVazio(c.cid),
    observacao: nuloSeVazio(c.observacao),
  }));
