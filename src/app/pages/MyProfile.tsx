import { useState, useEffect } from "react";
import { User as UserIcon, Lock, Shield, Loader2, ArrowLeft } from "lucide-react";
import { apiFetch } from "../lib/api";
import { formatCPF, formatPhone } from "../lib/utils";
import type { AppUser, View } from "../types";

export function MyProfile({
  user,
  onNavigate,
  onUpdateUser
}: {
  user: AppUser;
  onNavigate: (v: View) => void;
  onUpdateUser: (u: AppUser) => void;
}) {
  const [name, setName] = useState(user.name);
  const [cpf, setCpf] = useState(user.cpf || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [passError, setPassError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({ name, cpf, phone, avatarUrl })
      });
      onUpdateUser({ ...user, ...data });
      setMessage("Perfil atualizado com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage("");
    setPassError("");

    try {
      await apiFetch("/users/me/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setPassMessage("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPassError(err.message || "Erro ao alterar senha.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button
        onClick={() => onNavigate(user.role === "company" ? "b2b" : "my-panel")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8"
      >
        <ArrowLeft size={14} /> Voltar
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 border border-amber-500/20">
          <UserIcon size={20} />
        </div>
        <div>
          <h1 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground text-sm">Gerencie suas informações pessoais e de segurança</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-6 flex items-center gap-2">
            <UserIcon size={18} className="text-amber-400" />
            Dados Pessoais
          </h2>
          
          {message && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-md">{message}</div>}
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">{error}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">NOME COMPLETO</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">CPF (OPCIONAL)</label>
              <input
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">TELEFONE (OPCIONAL)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">E-MAIL</label>
              <input
                disabled
                value={user.email}
                className="w-full bg-muted/50 border border-border rounded-md px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-lg p-6 h-fit">
          <h2 className="text-lg font-medium text-foreground mb-6 flex items-center gap-2">
            <Lock size={18} className="text-emerald-400" />
            Segurança
          </h2>

          {passMessage && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-md">{passMessage}</div>}
          {passError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-md">{passError}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">SENHA ATUAL</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual"
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">NOVA SENHA</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mín. 8 caracteres"
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-2.5 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {passLoading && <Loader2 className="animate-spin" size={16} />}
              Alterar Senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
