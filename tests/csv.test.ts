import { describe, it, expect } from "vitest";
import { gerarCSV } from "@/lib/csv";

describe("gerarCSV", () => {
  it("inclui BOM e escapa separadores", () => {
    const csv = gerarCSV([{ municipio: "Almeirim; PA", total: 3 }]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Almeirim; PA";3');
  });
  it("retorna só BOM quando vazio", () => {
    expect(gerarCSV([])).toBe("\uFEFF");
  });
});
