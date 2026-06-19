import { z } from "zod";

export const aplicarProtocoloSchema = z.object({
  pacienteId: z.string().min(1, "Selecione o paciente"),
  respostas: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
});
export type AplicarProtocoloInput = z.infer<typeof aplicarProtocoloSchema>;
