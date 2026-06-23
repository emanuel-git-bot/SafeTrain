import { useState, useEffect } from "react";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "../../lib/api";

interface Area {
  id: number;
  name: string;
  description: string;
}

export function AdminAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const data = await apiFetch("/admin/areas");
      setAreas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await apiFetch(`/admin/areas/${editingArea.id}`, {
          method: "PUT",
          body: JSON.stringify(formData)
        });
      } else {
        await apiFetch("/admin/areas", {
          method: "POST",
          body: JSON.stringify(formData)
        });
      }
      setIsFormOpen(false);
      setEditingArea(null);
      setFormData({ name: "", description: "" });
      fetchAreas();
    } catch (err) {
      alert("Erro ao salvar área.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar?")) {
      try {
        await apiFetch(`/admin/areas/${id}`, { method: "DELETE" });
        fetchAreas();
      } catch (err) {
        alert("Erro ao deletar área.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] tracking-wide">
            Áreas de Atuação
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Categorias globais usadas em cursos e empresas.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingArea(null);
            setFormData({ name: "", description: "" });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={16} /> Nova Área
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-[#0D1420] border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">NOME</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">DESCRIÇÃO</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50 h-20"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-400 text-[#090D18] rounded-md transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#0D1420] border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground font-mono text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">Descrição</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Carregando...</td></tr>
              ) : areas.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Nenhuma área encontrada.</td></tr>
              ) : (
                areas.map((area) => (
                  <tr key={area.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                          <Layers className="text-amber-500" size={14} />
                        </div>
                        <span className="font-medium text-foreground">{area.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{area.description}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingArea(area);
                          setFormData({ name: area.name, description: area.description || "" });
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-amber-400 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
