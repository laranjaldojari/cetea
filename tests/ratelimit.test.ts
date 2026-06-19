import { describe, it, expect } from "vitest";
import { limitar } from "@/lib/ratelimit";

describe("ratelimit", () => {
  it("bloqueia após exceder o limite", () => {
    const k = "teste:" + Math.random();
    expect(limitar(k, 2, 1000).ok).toBe(true);
    expect(limitar(k, 2, 1000).ok).toBe(true);
    expect(limitar(k, 2, 1000).ok).toBe(false);
  });
});
