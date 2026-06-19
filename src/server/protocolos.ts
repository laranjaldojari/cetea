// =============================================================================
// Motor genérico de protocolos de avaliação.
// As regras de pontuação ficam aqui; os ITENS e FAIXAS vêm da `definicao`
// (JSON) de cada Protocolo. Assim, M-CHAT-R, CARS, SNAP-IV, ATA e novos
// instrumentos são suportados sem alterar código nem schema.
//
// IMPORTANTE: o texto oficial dos itens é responsabilidade da instituição
// (questão de licenciamento). Aqui tratamos apenas da lógica de correção.
// =============================================================================

export type TipoResposta = "SIM_NAO" | "PRESENCA" | "ESCALA";
export type Metodo = "CONTAGEM_RISCO" | "SOMA" | "SOMA_SUBESCALAS";

export interface ItemProtocolo {
  id: string;
  texto: string;
  categoria?: string;
  reverso?: boolean; // p/ SIM_NAO: quando true, SIM indica risco
}
export interface Faixa { de: number; ate: number; classificacao: string }
export interface Subescala { nome: string; itens: string[]; faixas?: Faixa[] }

export interface DefinicaoProtocolo {
  respondente?: string;
  instrucoes?: string;
  tipoResposta: TipoResposta;
  opcoes?: { valor: number; rotulo: string }[]; // p/ ESCALA
  itens: ItemProtocolo[];
  metodo: Metodo;
  faixas?: Faixa[];
  subescalas?: Subescala[];
  notaLicenca?: string;
  itensExemplo?: boolean; // sinaliza itens placeholder
}

export type Respostas = Record<string, string | number | boolean>;

export interface ResultadoSubescala { nome: string; soma: number; media: number; itens: number; classificacao?: string }
export interface Resultado {
  pontuacaoTotal: number;
  classificacao: string;
  subescalas?: ResultadoSubescala[];
  respondidos: number;
  totalItens: number;
}

function classificar(valor: number, faixas?: Faixa[]): string {
  if (!faixas?.length) return "—";
  const f = faixas.find((x) => valor >= x.de && valor <= x.ate);
  return f?.classificacao ?? "Fora das faixas definidas";
}

const ehSim = (v: unknown) => v === "SIM" || v === true || v === "true" || v === 1 || v === "1";

export function pontuar(def: DefinicaoProtocolo, respostas: Respostas): Resultado {
  const respondidos = def.itens.filter((i) => respostas[i.id] !== undefined && respostas[i.id] !== "").length;
  const base = { respondidos, totalItens: def.itens.length };

  if (def.metodo === "CONTAGEM_RISCO") {
    let pontos = 0;
    for (const item of def.itens) {
      const r = respostas[item.id];
      if (r === undefined || r === "") continue;
      if (def.tipoResposta === "PRESENCA") {
        if (ehSim(r)) pontos++; // comportamento presente = 1 (ex.: ATA)
      } else {
        // SIM_NAO: risco = NÃO, exceto itens reversos (risco = SIM)
        const riscoSim = Boolean(item.reverso);
        const respSim = ehSim(r);
        if (respSim === riscoSim) pontos++;
      }
    }
    return { ...base, pontuacaoTotal: pontos, classificacao: classificar(pontos, def.faixas) };
  }

  // Métodos numéricos (ESCALA)
  const num = (id: string) => {
    const v = respostas[id];
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  if (def.metodo === "SOMA") {
    const total = def.itens.reduce((acc, i) => acc + num(i.id), 0);
    return { ...base, pontuacaoTotal: total, classificacao: classificar(total, def.faixas) };
  }

  // SOMA_SUBESCALAS (ex.: SNAP-IV)
  const subs = (def.subescalas ?? []).map<ResultadoSubescala>((sub) => {
    const soma = sub.itens.reduce((acc, id) => acc + num(id), 0);
    const media = sub.itens.length ? soma / sub.itens.length : 0;
    return {
      nome: sub.nome,
      soma,
      media: Math.round(media * 100) / 100,
      itens: sub.itens.length,
      classificacao: sub.faixas ? classificar(media, sub.faixas) : undefined,
    };
  });
  const total = def.itens.reduce((acc, i) => acc + num(i.id), 0);
  return {
    ...base,
    pontuacaoTotal: total,
    classificacao: subs.length ? "Ver subescalas" : classificar(total, def.faixas),
    subescalas: subs,
  };
}
