import bcrypt from "bcryptjs";

const ROUNDS = 12;

export const hashSenha = (senha: string) => bcrypt.hash(senha, ROUNDS);
export const verificarSenha = (senha: string, hash: string) => bcrypt.compare(senha, hash);
