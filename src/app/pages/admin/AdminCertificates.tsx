// ─── Admin: Certificates ─────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Search, Download, Eye, Building2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { BadgeLabel } from "../../components/ui/BadgeLabel";
import { UserAvatar } from "../../components/ui/UserAvatar";
import { apiFetch } from "../../lib/api";

export function AdminCertificates() {
  const [filter, setFilter] = useState<"all" | "b2b" | "b2c">("all");
  const [search, setSearch] = useState("");
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/admin/certificates");
        setCerts(data);
      } catch (e) {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = certs.filter(
    (c) =>
      (filter === "all" || c.type === filter) &&
      (c.student.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">Certificados</h2>
          <p className="text-muted-foreground text-sm">{certs.length} certificados emitidos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm text-foreground rounded-md hover:border-white/20 transition-colors">
          <Download size={14} /> Exportar todos
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno ou ID..."
            className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-md p-1">
          {(["all", "b2b", "b2c"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded transition-colors",
                filter === f ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "Todos" : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">ID</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">ALUNO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">CURSO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">TIPO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">EMISSÃO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum certificado encontrado.</td>
              </tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={c.student} size="sm" />
                    <span className="text-sm text-foreground">{c.student}</span>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{c.course}</span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  {c.type === "b2b" ? (
                    <BadgeLabel variant="blue"><Building2 size={9} /> B2B · {c.company}</BadgeLabel>
                  ) : (
                    <BadgeLabel variant="gray">B2C</BadgeLabel>
                  )}
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-xs font-mono text-muted-foreground">{c.issued}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <Eye size={11} /> Ver
                    </button>
                    <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                      <Download size={11} /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
