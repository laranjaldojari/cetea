import { describe, it, expect } from "vitest";
import { podeAcessar, podeEscrever } from "@/lib/rbac";

describe("rbac", () => {
  it("admin acessa tudo e escreve", () => {
    expect(podeAcessar("ADMIN", "unidades")).toBe(true);
    expect(podeEscrever("ADMIN")).toBe(true);
  });
  it("auditor é somente leitura", () => {
    expect(podeAcessar("AUDITOR", "pacientes")).toBe(true);
    expect(podeEscrever("AUDITOR")).toBe(false);
  });
  it("recepção não acessa unidades", () => {
    expect(podeAcessar("RECEPCAO", "unidades")).toBe(false);
  });
});
