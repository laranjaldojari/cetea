import { describe, it, expect } from "vitest";
import { pontuar, type DefinicaoProtocolo } from "@/server/protocolos";

describe("motor de protocolos", () => {
  it("M-CHAT-R conta risco com itens invertidos", () => {
    const def: DefinicaoProtocolo = {
      tipoResposta: "SIM_NAO", metodo: "CONTAGEM_RISCO",
      itens: [{ id: "1", texto: "" }, { id: "2", texto: "", reverso: true }, { id: "3", texto: "" }, { id: "4", texto: "" }, { id: "5", texto: "", reverso: true }],
      faixas: [{ de: 0, ate: 2, classificacao: "Baixo" }, { de: 3, ate: 7, classificacao: "Moderado" }, { de: 8, ate: 20, classificacao: "Alto" }],
    };
    const r = pontuar(def, { "1": "NAO", "2": "SIM", "3": "SIM", "4": "NAO", "5": "NAO" });
    expect(r.pontuacaoTotal).toBe(3);
    expect(r.classificacao).toBe("Moderado");
  });

  it("CARS soma valores numéricos", () => {
    const def: DefinicaoProtocolo = { tipoResposta: "ESCALA", metodo: "SOMA", itens: [{ id: "1", texto: "" }, { id: "2", texto: "" }, { id: "3", texto: "" }], faixas: [{ de: 0, ate: 29.5, classificacao: "Sem indícios" }] };
    expect(pontuar(def, { "1": 2, "2": 3.5, "3": 4 }).pontuacaoTotal).toBe(9.5);
  });

  it("ATA conta presenças", () => {
    const def: DefinicaoProtocolo = { tipoResposta: "PRESENCA", metodo: "CONTAGEM_RISCO", itens: [{ id: "1", texto: "" }, { id: "2", texto: "" }, { id: "3", texto: "" }], faixas: [{ de: 23, ate: 113, classificacao: "Acima" }] };
    expect(pontuar(def, { "1": true, "2": false, "3": true }).pontuacaoTotal).toBe(2);
  });

  it("SNAP-IV soma por subescalas", () => {
    const def: DefinicaoProtocolo = { tipoResposta: "ESCALA", metodo: "SOMA_SUBESCALAS", itens: [{ id: "1", texto: "" }, { id: "2", texto: "" }, { id: "3", texto: "" }, { id: "4", texto: "" }], subescalas: [{ nome: "A", itens: ["1", "2"] }, { nome: "B", itens: ["3", "4"] }] };
    const r = pontuar(def, { "1": 3, "2": 1, "3": 2, "4": 0 });
    expect(r.pontuacaoTotal).toBe(6);
    expect(r.subescalas?.[0]).toMatchObject({ nome: "A", soma: 4, media: 2 });
  });
});
