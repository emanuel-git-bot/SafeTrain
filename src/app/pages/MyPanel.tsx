// ─── My Panel ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  PlayCircle, CheckCircle2, Award, Clock, Plus, Play, Eye, Download,
} from "lucide-react";
import { cn, getImageUrl } from "../lib/utils";
import { UserAvatar } from "../components/ui/UserAvatar";
import { BadgeLabel } from "../components/ui/BadgeLabel";
import { COURSES } from "../data/mockData";
import { apiFetch, API_URL } from "../lib/api";
import type { View, AppUser } from "../types";

export function MyPanel({
  user,
  onNavigate,
  onSelectEnrollment,
  initialTab = "in_progress"
}: {
  user: AppUser;
  onNavigate: (v: View) => void;
  onSelectEnrollment?: (id: number) => void;
  initialTab?: "in_progress" | "completed" | "recommended";
}) {
  const [tab, setTab] = useState<"in_progress" | "completed" | "recommended">(initialTab);
  
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Task 1.1: Substituir MY_COURSES por /users/me/enrollments
  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/users/me/enrollments");
        const mapped = data.map((e: any) => ({
          ...e,
          title: e.course?.title || "Curso",
          image: e.course?.image || "photo-1504307651254-35680f356dfd",
          modules: e.course?.modules || 4,
          done: e.progress >= 100 ? 4 : Math.floor((e.progress / 100) * 4)
        }));
        setEnrollments(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const downloadPdf = async (enrollmentId: number) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${API_URL}/enrollments/${enrollmentId}/certificate`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Falha ao gerar PDF');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Certificado_${enrollmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Erro ao baixar o PDF: ' + (err.message || 'Tente novamente.'));
    }
  };

  const inProgress = enrollments.filter((c) => c.status === "in_progress");
  const completed = enrollments.filter((c) => c.status === "completed");

  const stats = [
    { label: "Em andamento", value: inProgress.length, icon: <PlayCircle size={16} />, color: "text-amber-400" },
    { label: "Concluídos", value: completed.length, icon: <CheckCircle2 size={16} />, color: "text-emerald-400" },
    { label: "Certificados", value: completed.length, icon: <Award size={16} />, color: "text-blue-400" },
    { label: "Horas estudadas", value: "28h", icon: <Clock size={16} />, color: "text-purple-400" },
  ];

  const tabs = [
    { key: "in_progress", label: `Em andamento (${inProgress.length})` },
    { key: "completed", label: `Concluídos (${completed.length})` },
    { key: "recommended", label: "Recomendados" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} size="lg" />
          <div>
            <p className="text-xs font-mono text-muted-foreground">MEU PAINEL</p>
            <h1 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground">
              {user.name}
            </h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("catalog")}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
        >
          <Plus size={14} /> Novo curso
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5">
            <div className={cn("mb-3", s.color)}>{s.icon}</div>
            <div className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              "px-5 py-3 text-sm font-medium transition-colors -mb-px border-b-2",
              tab === t.key
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* In progress */}
      {tab === "in_progress" && (
        <div className="space-y-4">
          {inProgress.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-lg p-5 flex gap-5 items-center hover:border-white/15 transition-colors"
            >
              <div className="w-20 h-14 rounded-md overflow-hidden shrink-0 bg-slate-800">
                <img
                  src={getImageUrl(c.image)}
                  alt=""
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground mb-1 truncate">{c.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-muted rounded-full h-1.5 max-w-xs">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{c.progress}%</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {c.done}/{c.modules} módulos
                </p>
              </div>
              <button
                onClick={() => {
                  if (onSelectEnrollment) onSelectEnrollment(c.id);
                  onNavigate("classroom");
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Play size={13} /> Continuar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {tab === "completed" && (
        <div className="space-y-4">
          {completed.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-lg p-5 flex gap-5 items-center"
            >
              <div className="w-20 h-14 rounded-md overflow-hidden shrink-0 bg-slate-800 relative">
                <img
                  src={getImageUrl(c.image)}
                  alt={c.title}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground mb-1 truncate">{c.title}</h3>
                <div className="flex items-center gap-2">
                  <BadgeLabel variant="green">
                    <CheckCircle2 size={10} /> Concluído
                  </BadgeLabel>
                  {(c as any).certId && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {(c as any).certId}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (onSelectEnrollment) onSelectEnrollment(c.id);
                    onNavigate("certificate");
                  }}
                  className="px-4 py-2 bg-card border border-border text-sm text-foreground rounded-md hover:border-white/20 transition-colors flex items-center gap-1.5"
                >
                  <Eye size={13} /> Ver cert.
                </button>
                <button
                  onClick={() => downloadPdf(c.id)}
                  className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-md hover:bg-emerald-500/15 transition-colors flex items-center gap-1.5"
                >
                  <Download size={13} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended */}
      {tab === "recommended" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COURSES.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-lg p-4 flex gap-4 hover:border-amber-500/30 transition-colors"
            >
              <div className="w-16 h-14 rounded-md overflow-hidden shrink-0 bg-slate-800">
                <img
                  src={getImageUrl(c.image)}
                  alt={c.title}
                  className="w-full h-full object-cover opacity-70"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground mb-1 truncate">{c.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {c.duration} · {c.modules} módulos
                </p>
                <span className="font-['Barlow_Condensed'] text-lg font-bold text-amber-400">
                  R$ {c.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
