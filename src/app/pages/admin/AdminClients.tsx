import { useState, useEffect } from "react";
import { Users, Search, Filter, Shield, Key, Settings2, X, ChevronDown } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { cn } from "../../lib/utils";

interface Client {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions?: string | null;
  createdAt: string;
  companyStudent?: {
    company: { name: string };
  };
}

const ADMIN_SECTIONS = [
  { key: "view_clients",      label: "Clientes" },
  { key: "view_courses",      label: "Cursos" },
  { key: "view_certificates", label: "Certificados" },
  { key: "view_areas",        label: "Áreas de Atuação" },
  { key: "view_metrics",      label: "Métricas" },
  { key: "view_coupons",      label: "Cupons" },
  { key: "view_plans",        label: "Planos B2B" },
  { key: "view_settings",     label: "Configurações" },
];

function PermissionsModal({
  client,
  onClose,
  onSave,
}: {
  client: Client;
  onClose: () => void;
  onSave: (id: number, role: string, permissions: string[]) => Promise<void>;
}) {
  const [role, setRole] = useState(client.role);
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      return client.permissions ? JSON.parse(client.permissions) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (key: string) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      await onSave(client.id, role, role === "admin" ? selected : []);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D1420] border border-border rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-400" />
            <h3 className="font-bold text-foreground">Permissões de Acesso</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-amber-400 font-bold text-sm">{client.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.email}</p>
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-2">TIPO DE CONTA</label>
            <div className="relative">
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50 appearance-none pr-9"
              >
                <option value="student">Aluno (B2C)</option>
                <option value="company">Empresa (B2B)</option>
                <option value="admin">Administrador</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Section permissions — only shown when admin */}
          {role === "admin" && (
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-3">SEÇÕES DO PAINEL</label>
              <div className="space-y-2">
                {ADMIN_SECTIONS.map(sec => (
                  <label
                    key={sec.key}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none",
                      selected.includes(sec.key)
                        ? "border-amber-500/40 bg-amber-500/5 text-amber-400"
                        : "border-border bg-card text-foreground hover:border-white/20"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(sec.key)}
                      onChange={() => toggle(sec.key)}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span className="text-sm">{sec.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                O admin sem nenhuma seção marcada não poderá acessar o painel.
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tempPasswords, setTempPasswords] = useState<Record<number, string>>({});
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadClients = async () => {
    try {
      const data = await apiFetch("/admin/users");
      setClients(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...clients];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.companyStudent?.company?.name?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") {
      result = result.filter(c => c.role === roleFilter);
    }
    setFiltered(result);
  }, [search, roleFilter, clients]);

  const handleResetPassword = async (id: number) => {
    try {
      const res = await apiFetch(`/admin/users/${id}/reset-password`, { method: "POST" });
      setTempPasswords(prev => ({ ...prev, [id]: res.tempPassword }));
    } catch {
      alert("Erro ao resetar senha");
    }
  };

  const handleSavePermissions = async (id: number, role: string, permissions: string[]) => {
    await apiFetch(`/admin/users/${id}/role-permissions`, {
      method: "PUT",
      body: JSON.stringify({ role, permissions }),
    });
    // Update local state immediately
    setClients(prev =>
      prev.map(c => c.id === id ? { ...c, role, permissions: JSON.stringify(permissions) } : c)
    );
  };

  const roleLabel = (role: string) => {
    if (role === "admin") return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium">
        <Shield size={11} /> Admin
      </span>
    );
    if (role === "company") return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium">
        <Shield size={11} /> B2B
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium">
        <Users size={11} /> Aluno
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] tracking-wide">
            Gestão de Clientes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Alunos B2C, Colaboradores, Contas B2B e Admins
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar por nome, email ou empresa..."
            className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-background border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50 appearance-none"
          >
            <option value="all">Todos os tipos</option>
            <option value="student">Alunos</option>
            <option value="company">Empresas</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-auto">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#0D1420] border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground font-mono text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Nome / Email</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Empresa</th>
                <th className="px-6 py-4 font-medium">Cadastro</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Nenhum cliente encontrado.</td></tr>
              ) : (
                filtered.map(client => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                          <span className="text-amber-500 font-medium text-xs">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{client.name}</div>
                          <div className="text-xs text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{roleLabel(client.role)}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {client.companyStudent?.company?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Permissions button */}
                        <button
                          onClick={() => setEditingClient(client)}
                          title="Gerenciar permissões"
                          className="p-1.5 text-muted-foreground hover:text-amber-400 transition-colors"
                        >
                          <Settings2 size={15} />
                        </button>

                        {/* Reset password */}
                        {tempPasswords[client.id] ? (
                          <span className="text-green-400 font-mono text-xs bg-green-400/10 px-2 py-1 rounded">
                            Nova Senha: {tempPasswords[client.id]}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleResetPassword(client.id)}
                            title="Resetar Senha"
                            className="p-1.5 text-muted-foreground hover:text-amber-400 transition-colors"
                          >
                            <Key size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      {editingClient && (
        <PermissionsModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  );
}
