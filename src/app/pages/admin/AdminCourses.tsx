// ─── Admin: Courses ───────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Search, Plus, Edit3, Trash2 } from "lucide-react";
import { BadgeLabel } from "../../components/ui/BadgeLabel";
import { api } from "../../lib/api";
import { getImageUrl } from "../../lib/utils";

export function AdminCourses({ onEdit }: { onEdit: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await api.post('/admin/courses', {
        title: "Novo Curso",
        price: 0,
        published: false
      });
      onEdit(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/courses/${id}`);
      setCourses(courses => courses.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">Cursos</h2>
          <p className="text-muted-foreground text-sm">{courses.length} cursos cadastrados</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
        >
          <Plus size={14} /> Novo curso
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cursos..."
          className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">CURSO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">ALUNOS</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">PREÇO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">STATUS</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum curso encontrado.</td>
              </tr>
            ) : filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 rounded overflow-hidden shrink-0 bg-slate-800">
                      <img
                        src={getImageUrl(c.image)}
                        alt=""
                        className="w-full h-full object-cover opacity-60"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {c.duration || "0h"} · {c._count?.modules || 0} módulos
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {(c._count?.enrollments || 0).toLocaleString("pt-BR")}
                  </span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="font-mono text-sm text-amber-400">R$ {c.price || 0}</span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  {c.published ? (
                    <BadgeLabel variant="green">Publicado</BadgeLabel>
                  ) : (
                    <BadgeLabel variant="orange">Rascunho</BadgeLabel>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(c.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit3 size={12} /> Editar
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
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
