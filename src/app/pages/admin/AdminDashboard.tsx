// ─── Admin: Dashboard ─────────────────────────────────────────────────────────

import {
  Banknote, UserPlus, BadgeCheck, Percent,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "../../lib/utils";

import { apiFetch } from "../../lib/api";
import { useState, useEffect } from "react";

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [res, metrics] = await Promise.all([
          apiFetch("/admin/analytics"),
          apiFetch("/admin/metrics")
        ]);
        setData({ ...res, ...metrics });
      } catch (e) {}
    }
    load();
  }, []);

  const kpis = [
    { label: "Receita Total", value: `R$ ${data?.totalRevenue || 0}`, icon: <Banknote size={16} />, color: "text-amber-400" },
    { label: "Total alunos", value: `${data?.totalStudents || 0}`, icon: <UserPlus size={16} />, color: "text-blue-400" },
    { label: "Cursos Ativos", value: `${data?.activeCourses || 0}`, icon: <BadgeCheck size={16} />, color: "text-emerald-400" },
    { label: "Taxa de conclusão", value: `${data?.completionRate || 0}%`, icon: <Percent size={16} />, color: "text-purple-400" },
  ];

  const recentActivity = (data?.recentEnrollments || []).map((e: any) => ({
    user: e.user?.name || 'Desconhecido',
    action: `Iniciou o curso ${e.course?.title || ''}`,
    time: new Date(e.createdAt).toLocaleDateString(),
    color: "bg-blue-400"
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Visão geral da plataforma — Junho 2024</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-lg p-5">
            <div className={cn("mb-3", k.color)}>{k.icon}</div>
            <div className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground">{k.value}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground font-mono">{k.label}</span>
              {k.delta && <span className="text-xs text-emerald-400 font-mono">{k.delta}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-5">Matrículas vs Conclusões</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.monthly || []}>
              <defs>
                <linearGradient id="gMatr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gConc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#E2E8F0" }} />
              <Area type="monotone" dataKey="matriculas" stroke="#F59E0B" fill="url(#gMatr)" strokeWidth={2} dot={false} name="Matrículas" />
              <Area type="monotone" dataKey="concluidos" stroke="#10B981" fill="url(#gConc)" strokeWidth={2} dot={false} name="Concluídos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-5">Atividade recente</h3>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", a.color)} />
                <div>
                  <p className="text-xs text-foreground">
                    <span className="font-medium">{a.user}</span> {a.action}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course performance */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-foreground mb-5">Performance por curso</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.coursesPerf || []} barGap={4}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#E2E8F0" }} />
            <Bar dataKey="alunos" fill="#F59E0B" radius={[3, 3, 0, 0]} name="Alunos" />
            <Bar dataKey="taxa" fill="#10B981" radius={[3, 3, 0, 0]} name="Taxa %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
