import { describe, it, expect } from "vitest";
import { idade } from "@/lib/utils";
import { inicioDaSemana, diasDaSemana } from "@/lib/date";

describe("date", () => {
  it("calcula idade", () => {
    const nasc = new Date(); nasc.setFullYear(nasc.getFullYear() - 10);
    expect(idade(nasc)).toBe(10);
  });
  it("semana começa na segunda e tem 7 dias", () => {
    const ini = inicioDaSemana(new Date("2026-06-17")); // quarta
    expect(ini.getDay()).toBe(1); // segunda
    expect(diasDaSemana(new Date("2026-06-17")).length).toBe(7);
  });
});
