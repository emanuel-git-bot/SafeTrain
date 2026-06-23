// ─── B2B Register Page ────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Shield, ArrowRight, Loader2, Building2 } from "lucide-react";
import { apiFetch } from "../lib/api";
import { formatCNPJ } from "../lib/utils";
import type { View, AppUser } from "../types";

export function B2BRegisterPage({
  onNavigate,
  onLogin,
}: {
  onNavigate: (v: View) => void;
  onLogin: (u: AppUser) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    cnpj: "",
    areaId: ""
  });
  const [areas, setAreas] = useState<{ id: number, name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/areas").then(setAreas).catch(() => {});
  }, []);

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData((prev) => ({ ...prev, cnpj: formatted }));
    
    const cleanCnpj = formatted.replace(/\D/g, "");
    if (cleanCnpj.length === 14) {
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({ ...prev, companyName: data.razao_social || data.nome_fantasia || prev.companyName }));
        }
      } catch (err) {}
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          role: "company",
          areaId: formData.areaId ? Number(formData.areaId) : null
        }),
      });

      localStorage.setItem("jwt_token", data.token);
      onLogin(data.user as AppUser);
      onNavigate("b2b");
    } catch (err: any) {
      setError(err.message || "Erro no cadastro corporativo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 bg-[#090D18]">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-purple-500/10" />
        <div className="relative z-10 max-w-md text-center">
          <Building2 size={64} className="text-amber-400 mx-auto mb-6" />
          <h2 className="font-['Barlow_Condensed'] text-4xl font-black text-foreground leading-tight mb-4">
            SafeTrain para Empresas
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Cadastre sua empresa, gerencie treinamentos de NRs para seus colaboradores e garanta total conformidade com a legislação.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center">
              <Shield size={16} className="text-[#090D18]" />
            </div>
            <span className="font-['Barlow_Condensed'] text-2xl font-bold text-foreground">
              SafeTrain B2B
            </span>
          </div>

          <h1 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">
            Cadastro Corporativo
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Crie a conta gestora da sua empresa</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">NOME DO GESTOR</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">EMAIL DO GESTOR</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="voce@empresa.com"
                  className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">SENHA</label>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <hr className="border-border my-6" />

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">RAZÃO SOCIAL / NOME DA EMPRESA</label>
              <input
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Empresa LTDA"
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">CNPJ</label>
                <input
                  required
                  value={formData.cnpj}
                  onChange={handleCnpjChange}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">ÁREA DE ATUAÇÃO</label>
                <select
                  required
                  value={formData.areaId}
                  onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                  className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                >
                  <option value="" disabled>Selecione...</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Criar Conta Corporativa"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
