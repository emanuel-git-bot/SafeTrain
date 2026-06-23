// ─── B2B Dashboard ────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Building2, Award, TrendingUp, AlertTriangle, Users, Download,
  UserPlus, Search, MoreHorizontal, Package, Ticket, Tag, Upload,
  Copy, CheckCircle2, Link2, Unlink, BookOpen, Clock, ShoppingCart, Loader2
} from "lucide-react";
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "../lib/utils";
import { BadgeLabel } from "../components/ui/BadgeLabel";
import { UserAvatar } from "../components/ui/UserAvatar";
import { ALL_STUDENTS, CHART_MONTHLY } from "../data/mockData";
import { apiFetch } from "../lib/api";
import { useEffect } from "react";

import type { AppUser } from "../types";

export function B2BDashboard({ user }: { user: AppUser }) {
  const [tab, setTab] = useState<"overview" | "employees" | "vouchers" | "search" | "buy">("overview");
  const [searchEmp, setSearchEmp] = useState("");
  const [searchNew, setSearchNew] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<(typeof ALL_STUDENTS)[0] | null | undefined>(undefined);
  const [linkedIds, setLinkedIds] = useState<number[]>([1, 2, 3, 4, 6]);

  const [employees, setEmployees] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [simLoading, setSimLoading] = useState(false);
  const [simData, setSimData] = useState<any>(null);
  const [simError, setSimError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [pixData, setPixData] = useState<{ qrCodeUrl: string, paymentUrl: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (!user.companyId) return;
        const query = searchEmp ? `?search=${encodeURIComponent(searchEmp)}` : "";
        const emps = await apiFetch(`/companies/${user.companyId}/students${query}`);
        const vous = await apiFetch(`/companies/${user.companyId}/vouchers`);
        const pls = await apiFetch("/b2b/plans");
        setEmployees(emps);
        setVouchers(vous);
        setPlans(pls);
      } catch (e) {}
    }
    load();
  }, [user.companyId, searchEmp]);

  const filtered = employees;

  const searchEmployee = () => {
    const found = ALL_STUDENTS.find(
      (s) =>
        s.email.toLowerCase().includes(searchNew.toLowerCase()) ||
        s.name.toLowerCase().includes(searchNew.toLowerCase())
    );
    setFoundEmployee(found ?? null);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "certified")
      return <BadgeLabel variant="green"><CheckCircle2 size={10} /> Certificado</BadgeLabel>;
    if (status === "in_progress")
      return <BadgeLabel variant="amber"><Clock size={10} /> Em andamento</BadgeLabel>;
    return <BadgeLabel variant="gray">Pendente</BadgeLabel>;
  };

  const tabs = [
    { k: "overview" as const, l: "Visão Geral" },
    { k: "employees" as const, l: "Colaboradores" },
    { k: "vouchers" as const, l: "Vouchers" },
    { k: "search" as const, l: "Buscar Funcionário" },
    { k: "buy" as const, l: "Comprar Vouchers" },
  ];

  const pieData = [
    { name: "Certificados", value: 3, color: "#10B981" },
    { name: "Em andamento", value: 2, color: "#F59E0B" },
    { name: "Pendente", value: 1, color: "#374151" },
  ];

  const voucherList = vouchers.map(v => ({
    code: v.code,
    status: v.userId ? "used" : "pending",
    user: v.userId ? `Usuário ID ${v.userId}` : "—",
    date: new Date(v.createdAt).toLocaleDateString()
  }));

  const handleSimulate = async () => {
    if (!selectedPlanId) return;
    setSimLoading(true);
    setSimError("");
    try {
      const data = await apiFetch("/orders/simulate", {
        method: "POST",
        body: JSON.stringify({ planId: selectedPlanId, couponCode })
      });
      setSimData(data);
    } catch (err: any) {
      setSimError(err.message || "Erro na simulação");
    } finally {
      setSimLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlanId || !simData) return;
    setCheckoutLoading(true);
    setSimError("");
    try {
      const response = await apiFetch("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({ 
          planId: selectedPlanId, 
          couponId: simData.coupon?.id,
          paymentMethod
        })
      });
      
      if (response.paymentStatus === 'pending' && response.qrCodeUrl) {
        setPixData({ qrCodeUrl: response.qrCodeUrl, paymentUrl: response.paymentUrl });
      } else {
        setCheckoutSuccess(true);
        // Reload vouchers
        const vous = await apiFetch(`/companies/${user.companyId}/vouchers`);
        setVouchers(vous);
      }
    } catch (err: any) {
      setSimError(err.message || "Erro no checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-amber-400" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">Painel B2B — RH</span>
          </div>
          <h1 className="font-['Barlow_Condensed'] text-4xl font-bold text-foreground">
            {user.company || "Minha Empresa"}
          </h1>
          <p className="text-muted-foreground text-sm">
            50 vagas · {employees.length} colaboradores
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm text-foreground rounded-md hover:border-white/20 transition-colors">
            <Download size={14} /> Exportar
          </button>
          <button
            onClick={() => setTab("search")}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
          >
            <UserPlus size={14} /> Adicionar colaborador
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-8">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "px-5 py-3 text-sm font-medium transition-colors -mb-px border-b-2",
              tab === t.k
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Certificados", value: employees.filter((e) => e.status === "certified").length, color: "text-emerald-400", icon: <Award size={16} /> },
              { label: "Em andamento", value: employees.filter((e) => e.status === "in_progress").length, color: "text-amber-400", icon: <TrendingUp size={16} /> },
              { label: "Pendentes", value: employees.filter((e) => e.status === "pending").length, color: "text-slate-400", icon: <AlertTriangle size={16} /> },
              { label: "Vagas disponíveis", value: 50 - vouchers.length, color: "text-blue-400", icon: <Users size={16} /> },
            ].map((k) => (
              <div key={k.label} className="bg-card border border-border rounded-lg p-5">
                <div className={cn("mb-3", k.color)}>{k.icon}</div>
                <div className="font-['Barlow_Condensed'] text-4xl font-bold text-foreground">{k.value}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-foreground mb-5">Conclusões por mês</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={CHART_MONTHLY.map((d) => ({ month: d.month, concluídos: d.concluidos, matriculados: d.matriculas }))}>
                  <defs>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#E2E8F0" }} />
                  <Area type="monotone" dataKey="concluídos" stroke="#F59E0B" fill="url(#grad2)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-foreground mb-5">Status da equipe</h3>
              <div className="flex justify-center">
                <PieChart width={140} height={140}>
                  <Pie data={pieData} cx={70} cy={70} innerRadius={45} outerRadius={62} dataKey="value" strokeWidth={0}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-mono text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employees */}
      {tab === "employees" && (
        <div>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
                placeholder="Buscar colaborador..."
                className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">COLABORADOR</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">CARGO</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">PROGRESSO</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">STATUS</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={emp.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{emp.role || "Operador"}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 w-32">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className={cn("h-1.5 rounded-full", emp.progress === 100 ? "bg-emerald-400" : emp.progress > 0 ? "bg-amber-400" : "bg-muted-foreground/30")}
                            style={{ width: `${emp.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">{emp.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={emp.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {emp.cert && (
                          <button className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                            <Download size={12} /> Cert.
                          </button>
                        )}
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vouchers */}
      {tab === "vouchers" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total de vagas", value: `${vouchers.length}`, icon: <Package size={16} />, sub: "Plano atual" },
              { label: "Usados", value: `${vouchers.filter(v => v.userId).length}`, icon: <Ticket size={16} />, sub: "Utilizados" },
              { label: "Disponíveis", value: `${vouchers.filter(v => !v.userId).length}`, icon: <Tag size={16} />, sub: "Prontos para distribuir" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-lg p-5">
                <div className="text-amber-400 mb-3">{s.icon}</div>
                <div className="font-['Barlow_Condensed'] text-4xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-foreground mt-1">{s.label}</div>
                <div className="text-xs text-muted-foreground font-mono">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Distribuir vouchers</h3>
            <div className="flex gap-3">
              <input
                placeholder="email@empresa.com, email2@..."
                className="flex-1 bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
              />
              <button className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors flex items-center gap-2">
                <Upload size={14} /> Enviar
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Cada e-mail receberá um voucher único para cadastro.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-xs font-mono text-muted-foreground">VOUCHERS GERADOS</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">CÓDIGO</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">STATUS</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">USADO POR</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-muted-foreground">DATA</th>
                </tr>
              </thead>
              <tbody>
                {voucherList.map((v) => (
                  <tr key={v.code} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">{v.code}</span>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {v.status === "used" ? (
                        <BadgeLabel variant="green"><CheckCircle2 size={10} /> Usado</BadgeLabel>
                      ) : (
                        <BadgeLabel variant="gray">Disponível</BadgeLabel>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{v.user}</td>
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{v.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search employee */}
      {tab === "search" && (
        <div className="max-w-2xl">
          <div className="mb-6">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold text-foreground mb-1">
              Buscar Funcionário
            </h3>
            <p className="text-muted-foreground text-sm">
              Pesquise pelo e-mail ou nome do funcionário que já criou conta na plataforma para vinculá-lo à empresa.
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchNew}
                onChange={(e) => setSearchNew(e.target.value)}
                placeholder="E-mail ou nome do funcionário..."
                className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
                onKeyDown={(e) => e.key === "Enter" && searchEmployee()}
              />
            </div>
            <button
              onClick={searchEmployee}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
            >
              Buscar
            </button>
          </div>

          {foundEmployee === null && (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <AlertTriangle size={28} className="text-amber-400 mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">Nenhum funcionário encontrado</p>
              <p className="text-muted-foreground text-sm">
                Verifique se o e-mail está correto e se o funcionário já criou sua conta.
              </p>
            </div>
          )}

          {foundEmployee && (
            <div className="bg-card border border-border rounded-lg p-5 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <UserAvatar name={foundEmployee.name} size="lg" />
                  <div>
                    <p className="font-medium text-foreground">{foundEmployee.name}</p>
                    <p className="text-sm text-muted-foreground">{foundEmployee.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <BadgeLabel variant="gray"><BookOpen size={9} /> {foundEmployee.courses} cursos</BadgeLabel>
                      <BadgeLabel variant="green"><Award size={9} /> {foundEmployee.certs} certificados</BadgeLabel>
                    </div>
                  </div>
                </div>
                {linkedIds.includes(foundEmployee.id) ? (
                  <div className="flex flex-col items-end gap-2">
                    <BadgeLabel variant="green"><Link2 size={10} /> Vinculado</BadgeLabel>
                    <button
                      onClick={() => setLinkedIds((ids) => ids.filter((id) => id !== foundEmployee.id))}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Unlink size={11} /> Desvincular
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setLinkedIds((ids) => [...ids, foundEmployee.id])}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors shrink-0"
                  >
                    <Link2 size={14} /> Vincular
                  </button>
                )}
              </div>
              {!linkedIds.includes(foundEmployee.id) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Ao vincular, você terá acesso ao progresso e certificados deste funcionário. Ele será notificado por e-mail.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">Como funciona</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {[
                "O funcionário cria uma conta na plataforma",
                "Ele informa o e-mail cadastrado ao gestor de RH",
                "O RH busca aqui e vincula à empresa",
                "O progresso fica visível neste painel",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Buy */}
      {tab === "buy" && (
        <div className="max-w-4xl">
          {checkoutSuccess ? (
            <div className="bg-card border border-border rounded-lg p-10 text-center">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Compra realizada com sucesso!</h2>
              <p className="text-muted-foreground mb-6">Os vouchers foram adicionados à sua conta e já podem ser distribuídos para a equipe.</p>
              <button
                onClick={() => { setCheckoutSuccess(false); setTab("vouchers"); }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-semibold rounded-md transition-colors"
              >
                Ver meus vouchers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Escolha um Plano</h2>
                <div className="space-y-4 mb-6">
                  {plans.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedPlanId(p.id); setSimData(null); }}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedPlanId === p.id ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-card border-border hover:border-white/20 text-foreground"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{p.name}</span>
                        <span className="font-mono font-bold">R$ {p.price.toFixed(2)}</span>
                      </div>
                      <div className="text-sm opacity-80">{p.voucherCount} vouchers inclusos</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 h-fit">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingCart size={18} /> Resumo do Pedido
                </h3>
                
                <div className="mb-4">
                  <label className="text-xs font-mono text-muted-foreground block mb-1.5">MÉTODO DE PAGAMENTO</label>
                  <select 
                    className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:border-amber-500/50 outline-none mb-4"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="pix">PIX</option>
                    <option value="credit_card">Cartão de Crédito</option>
                  </select>

                  <label className="text-xs font-mono text-muted-foreground block mb-1.5">CUPOM DE DESCONTO (OPCIONAL)</label>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value); setSimData(null); }}
                      placeholder="Ex: PROMO20"
                      className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:border-amber-500/50 outline-none"
                    />
                    <button
                      onClick={handleSimulate}
                      disabled={!selectedPlanId || simLoading}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-foreground text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                    >
                      {simLoading ? <Loader2 size={16} className="animate-spin" /> : "Simular"}
                    </button>
                  </div>
                  {simError && <p className="text-red-400 text-xs mt-2">{simError}</p>}
                </div>

                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>R$ {simData ? simData.planPrice.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Desconto</span>
                    <span>- R$ {simData ? simData.discount.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border mt-2">
                    <span>Total</span>
                    <span>R$ {simData ? simData.finalPrice.toFixed(2) : "0.00"}</span>
                  </div>
                </div>

                {pixData ? (
                  <div className="mt-6 text-center border border-border rounded-lg p-4 bg-muted/20">
                    <h4 className="text-foreground font-bold mb-2">Escaneie o QR Code</h4>
                    <img src={pixData.qrCodeUrl} alt="QR Code PIX" className="mx-auto mb-4 w-40 h-40 bg-white rounded p-2" />
                    <div className="flex items-center gap-2 bg-card border border-border rounded px-3 py-2">
                      <span className="text-xs font-mono text-muted-foreground truncate flex-1">{pixData.paymentUrl}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(pixData.paymentUrl)}
                        className="text-amber-400 hover:text-amber-300"
                        title="Copiar código"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Aguardando pagamento... (Em desenvolvimento: o webhook atualizará o status automaticamente)</p>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={!simData || checkoutLoading}
                    className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#090D18] font-bold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    {checkoutLoading && <Loader2 size={16} className="animate-spin" />}
                    Finalizar Compra
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
