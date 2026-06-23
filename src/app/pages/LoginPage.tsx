// ─── Login Page ───────────────────────────────────────────────────────────────

import { useState } from "react";
import { Shield, Settings, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { apiFetch } from "../lib/api";
import type { View, AppUser } from "../types";

export function LoginPage({
  onNavigate,
  onLogin,
}: {
  onNavigate: (v: View) => void;
  onLogin: (u: AppUser) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("jwt_token", data.token);
      onLogin(data.user as AppUser);
      onNavigate(data.user.role === "admin" ? "admin" : data.user.role === "company" ? "b2b" : "my-panel");
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-end">
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=1200&fit=crop&auto=format"
          alt="Segurança do trabalho"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090D18]/80 to-[#090D18]/20" />
        <div className="relative z-10 p-12 pb-16">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center">
              <Shield size={17} className="text-[#090D18]" />
            </div>
            <span className="font-['Barlow_Condensed'] text-2xl font-bold text-foreground">
              SafeTrain
            </span>
          </div>
          <h2 className="font-['Barlow_Condensed'] text-5xl font-black text-foreground leading-tight mb-4">
            Treinamentos EPI<br />
            <span className="text-amber-400">certificados digitais.</span>
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Plataforma moderna para cursos obrigatórios de segurança do trabalho.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center">
              <Shield size={14} className="text-[#090D18]" />
            </div>
            <span className="font-['Barlow_Condensed'] text-xl font-bold text-foreground">
              SafeTrain
            </span>
          </div>

          <h1 className="font-['Barlow_Condensed'] text-4xl font-bold text-foreground mb-1">
            Entrar
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Bem-vindo de volta</p>

          {/* Google button */}
          <button
            className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm rounded-md transition-colors mb-4 border border-gray-200"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">E-MAIL</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-muted-foreground">SENHA</label>
                <button type="button" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Esqueci a senha
                </button>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Entrar na plataforma"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>


          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <button
              onClick={() => onNavigate("register")}
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium mr-2"
            >
              Cadastrar-se
            </button>
            |
            <button
              onClick={() => onNavigate("b2b-register")}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium ml-2"
            >
              Para Empresas
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
