import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Tag } from "lucide-react";
import { apiFetch } from "../../lib/api";

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxUses, setMaxUses] = useState("");

  const loadCoupons = async () => {
    try {
      const data = await apiFetch("/coupons");
      setCoupons(data);
    } catch (e) {}
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/coupons", {
        method: "POST",
        body: JSON.stringify({
          code,
          discountPercent: Number(discountPercent),
          maxUses: maxUses ? Number(maxUses) : null,
        }),
      });
      setShowModal(false);
      setCode("");
      setDiscountPercent("");
      setMaxUses("");
      loadCoupons();
    } catch (err: any) {
      alert(err.message || "Erro ao criar cupom");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      await apiFetch(`/coupons/${id}`, { method: "DELETE" });
      loadCoupons();
    } catch (err: any) {
      alert("Erro ao excluir");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Cupons</h2>
          <p className="text-muted-foreground text-sm">Crie e gerencie cupons de desconto B2B</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-semibold rounded-md transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Novo Cupom
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">CÓDIGO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">DESCONTO</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">USOS</th>
              <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 font-mono font-bold text-amber-400">{c.code}</td>
                <td className="px-5 py-4">{c.discountPercent}%</td>
                <td className="px-5 py-4 text-muted-foreground">
                  {c.usedCount} / {c.maxUses || "Ilimitado"}
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  Nenhum cupom cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Tag size={18} /> Novo Cupom
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">CÓDIGO</label>
                <input
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: PROMO20"
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">DESCONTO (%)</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Ex: 20"
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">USOS MÁXIMOS (Opcional)</label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Ex: 100"
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-white/5 text-muted-foreground text-sm font-medium rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-bold rounded-md transition-colors"
                >
                  {loading ? "Criando..." : "Criar Cupom"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
