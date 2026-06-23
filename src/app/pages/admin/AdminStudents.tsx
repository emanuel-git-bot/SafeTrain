// ─── Admin: Students ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Search, Download, Building2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { BadgeLabel } from "../../components/ui/BadgeLabel";
import { UserAvatar } from "../../components/ui/UserAvatar";
import { apiFetch } from "../../lib/api";

export function AdminStudents() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "b2b" | "b2c">("all");
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/admin/users");
        const mapped = data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          type: u.companyStudent ? "b2b" : "b2c",
          company: u.companyStudent?.company?.name || null,
          courses: u.enrollments?.length || 0,
          certs: u.certificates?.length || 0,
          joined: new Date(u.createdAt).toLocaleDateString(),
          status: "active"
        }));
        setStudents(mapped);
      } catch (e) {}
    }
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      (filter === "all" || s.type === filter) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">Alunos</h2>
          <p className="text-muted-foreground text-sm">{students.length} alunos cadastrados</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm text-foreground rounded-md hover:border-white/20 transition-colors">
          <Download size={14} /> Exportar
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aluno..."
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
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">ALUNO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">TIPO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">CURSOS</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">CERTS.</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">CADASTRO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={s.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  {s.type === "b2b" ? (
                    <BadgeLabel variant="blue"><Building2 size={9} /> {s.company}</BadgeLabel>
                  ) : (
                    <BadgeLabel variant="gray">B2C</BadgeLabel>
                  )}
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">{s.courses}</span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">{s.certs}</span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-xs font-mono text-muted-foreground">{s.joined}</span>
                </td>
                <td className="px-5 py-4">
                  <BadgeLabel variant={s.status === "active" ? "green" : "gray"}>
                    {s.status === "active" ? "Ativo" : "Pendente"}
                  </BadgeLabel>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
