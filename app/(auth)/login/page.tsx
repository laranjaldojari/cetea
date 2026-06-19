"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    setCarregando(false);
    if (res.ok) router.push("/dashboard");
    else setErro("Credenciais inválidas. Verifique e tente novamente.");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Painel de marca */}
      <div className="hidden lg:flex flex-col justify-between bg-brand p-12 text-white">
        <div className="flex items-center gap-3">
          <Activity className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight">CETEA</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight max-w-md">
            Centro Especializado de Atendimento às Pessoas com Transtorno do Espectro Autista
          </h1>
          <p className="mt-4 text-white/80 max-w-md">
            Gestão clínica e assistencial centrada no cuidado longitudinal e na prestação de contas.
          </p>
        </div>
        <p className="text-sm text-white/60">Acesso restrito a profissionais autorizados.</p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-8 bg-surface">
        <form onSubmit={entrar} className="w-full max-w-sm space-y-5">
          <div className="lg:hidden flex items-center gap-2 text-brand">
            <Activity className="h-6 w-6" />
            <span className="font-semibold">CETEA</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Entrar no sistema</h2>
            <p className="text-sm text-ink-soft mt-1">Use suas credenciais institucionais.</p>
          </div>

          <label className="block text-sm">
            <span className="text-ink-soft">E-mail</span>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-surface px-3 py-2.5 outline-none focus:border-brand"
              placeholder="voce@instituicao.gov.br"
            />
          </label>

          <label className="block text-sm">
            <span className="text-ink-soft">Senha</span>
            <input
              type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-surface px-3 py-2.5 outline-none focus:border-brand"
              placeholder="••••••••"
            />
          </label>

          {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}

          <button
            type="submit" disabled={carregando}
            className="w-full rounded-xl bg-brand py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {carregando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
