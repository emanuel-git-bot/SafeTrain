import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { api } from "../../lib/api";

export function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [voucherCount, setVoucherCount] = useState("");

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/plans");
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setName(plan.name);
    setPrice(plan.price.toString());
    setVoucherCount(plan.voucherCount.toString());
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setVoucherCount("");
  };

  const handleSave = async () => {
    if (!name || !price || !voucherCount) {
      alert("Preencha todos os campos");
      return;
    }
    
    const data = {
      name,
      price: Number(price),
      voucherCount: Number(voucherCount)
    };

    try {
      if (editingId) {
        await api.put(`/admin/plans/${editingId}`, data);
      } else {
        await api.post("/admin/plans", data);
      }
      handleCancel();
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar plano");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este plano?")) return;
    try {
      await api.delete(`/admin/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">Planos B2B</h2>
        <p className="text-muted-foreground text-sm">Gerencie os pacotes de vouchers para empresas</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">
          {editingId ? "Editar Plano" : "Novo Plano"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">NOME DO PLANO</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Plano Ouro (100 Vouchers)"
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">PREÇO (R$)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">QTD VOUCHERS</label>
            <input
              type="number"
              value={voucherCount}
              onChange={(e) => setVoucherCount(e.target.value)}
              placeholder="Ex: 50"
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {editingId && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
          >
            {editingId ? "Salvar alterações" : <><Plus size={14} /> Adicionar plano</>}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">PLANO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">PREÇO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">VOUCHERS</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">Carregando...</td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum plano cadastrado.</td>
              </tr>
            ) : plans.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-sm text-foreground font-medium">{p.name}</td>
                <td className="px-5 py-4 text-sm text-amber-400 font-mono">R$ {p.price.toFixed(2)}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{p.voucherCount}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(p)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
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
