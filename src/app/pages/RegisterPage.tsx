// ─── Register Page ────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Shield, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { apiFetch } from "../lib/api";
import type { View, AppUser } from "../types";

export function RegisterPage({
  onNavigate,
  onLogin,
}: {
  onNavigate: (v: View) => void;
  onLogin: (u: AppUser) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [area, setArea] = useState("");
  const [voucher, setVoucher] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbAreas, setDbAreas] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    apiFetch("/areas").then(setDbAreas).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !pass || !area) return;
    
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ 
          name, 
          email, 
          password: pass, 
          areaId: area ? Number(area) : null, 
          voucherCode: voucher 
        }),
      });

      localStorage.setItem("jwt_token", data.token);
      onLogin(data.user as AppUser);
      onNavigate("my-panel");
    } catch (err: any) {
      setError(err.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => onNavigate("login")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8"
        >
          <ArrowLeft size={14} /> Voltar ao login
        </button>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center">
            <Shield size={14} className="text-[#090D18]" />
          </div>
          <span className="font-['Barlow_Condensed'] text-xl font-bold text-foreground">
            SafeTrain
          </span>
        </div>

        <h1 className="font-['Barlow_Condensed'] text-4xl font-bold text-foreground mb-1">
          Criar conta
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Comece sua jornada em segurança do trabalho
        </p>

        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">NOME COMPLETO</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">E-MAIL</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="seu@email.com"
              className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">SENHA</label>
            <input
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              type="password"
              placeholder="Mín. 8 caracteres"
              className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">ÁREA DE ATUAÇÃO</label>
            <select
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
            >
              <option value="" disabled>Selecione sua área...</option>
              {dbAreas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">
              CÓDIGO DE EMPRESA <span className="opacity-50">(opcional)</span>
            </label>
            <input
              value={voucher}
              onChange={(e) => setVoucher(e.target.value.toUpperCase())}
              placeholder="VTC-2024-XXXXX"
              className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Criar minha conta"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <button
            onClick={() => onNavigate("login")}
            className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
