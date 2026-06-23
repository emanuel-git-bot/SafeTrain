// ─── Admin: Metrics ───────────────────────────────────────────────────────────

import {
  AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";

export function AdminMetrics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/admin/metrics");
        setData(res);
      } catch (e) {}
    }
    load();
  }, []);

  const monthlyData = data?.monthly || [];
  const coursesPerf = data?.coursesPerf || [];

  const pieData = [
    { name: "B2C", value: 62, color: "#F59E0B" },
    { name: "B2B", value: 38, color: "#3B82F6" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">Métricas</h2>
        <p className="text-muted-foreground text-sm">Análise de desempenho da plataforma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-5">Receita mensal (R$)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#E2E8F0" }} />
              <Area type="monotone" dataKey="receita" stroke="#F59E0B" fill="url(#gRec)" strokeWidth={2} dot={false} name="Receita" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollments chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-5">Novas matrículas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#E2E8F0" }} />
              <Bar dataKey="matriculas" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Matrículas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Completion rate */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Taxa de conclusão por curso</h3>
          <div className="space-y-3">
            {coursesPerf.map((c: any) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{c.name}</span>
                  <span className="font-mono text-muted-foreground">{c.taxa}%</span>
                </div>
                <div className="bg-muted rounded-full h-1.5">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full"
                    style={{ width: `${c.taxa}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* B2C vs B2B pie */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Divisão B2C vs B2B</h3>
          <div className="flex items-center justify-center">
            <PieChart width={160} height={160}>
              <Pie
                data={pieData}
                cx={80}
                cy={80}
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-mono text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
