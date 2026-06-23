// ─── Landing Page ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  Shield, Zap, ArrowRight, Building2, ChevronRight, Award,
  BookOpen, CheckCircle2, QrCode, Globe,
} from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import { BadgeLabel } from "../components/ui/BadgeLabel";
import { CourseCard } from "./CatalogPage";
import { AREAS, PARTNERS } from "../data/mockData";
import type { View } from "../types";

export function LandingPage({
  onNavigate,
  onEnroll,
}: {
  onNavigate: (v: View) => void;
  onEnroll: (c: any) => void;
}) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(console.error);
  }, []);

  const filtered = selectedArea
    ? courses.filter((c) => c.areaId?.toString() === selectedArea || c.area === selectedArea)
    : courses.slice(0, 3);

  const heroStats = [
    { icon: <Award size={20} />, label: "Certificados emitidos", value: "48.200+" },
    { icon: <BookOpen size={20} />, label: "Cursos disponíveis", value: "120+" },
    { icon: <Building2 size={20} />, label: "Empresas parceiras", value: "340+" },
    { icon: <Shield size={20} />, label: "Taxa de aprovação", value: "96%" },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=900&fit=crop&auto=format"
            alt="Trabalhadores com EPIs"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090D18] via-[#090D18]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D18] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-mono mb-6">
              <Zap size={11} /> Certificações reconhecidas pelo MTE
            </div>
            <h1 className="font-['Barlow_Condensed'] text-6xl lg:text-8xl font-black text-foreground leading-none tracking-tight mb-6">
              SEGURANÇA<br />
              <span className="text-amber-400">DO TRABALHO</span><br />
              DIGITAL.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-8">
              Treinamentos obrigatórios em EPI com certificados digitais verificáveis.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("catalog")}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-semibold rounded-md transition-colors flex items-center gap-2"
              >
                Ver Cursos <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate("b2b-register")}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-semibold rounded-md transition-colors flex items-center gap-2"
              >
                <Building2 size={16} /> Para Empresas
              </button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {heroStats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-5"
              >
                <div className="text-amber-400 mb-2">{s.icon}</div>
                <div className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Area filter ── */}
      <section className="bg-[#0D1420] border-y border-border py-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm text-muted-foreground font-mono mb-5">
            Selecione sua área de atuação:
          </p>
          <div className="flex flex-wrap gap-3">
            {AREAS.map((area) => (
              <button
                key={area.id}
                onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-all",
                  selectedArea === area.id
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : "bg-card border-border text-muted-foreground hover:border-white/20 hover:text-foreground"
                )}
              >
                <span>{area.icon}</span> {area.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured courses ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-['Barlow_Condensed'] text-4xl font-bold text-foreground">
              {selectedArea
                ? `Cursos para ${AREAS.find((a) => a.id === selectedArea)?.label}`
                : "Cursos em Destaque"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {filtered.length} cursos disponíveis
            </p>
          </div>
          <button
            onClick={() => onNavigate("catalog")}
            className="flex items-center gap-1 text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors"
          >
            Ver todos <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onEnroll={onEnroll} />
          ))}
        </div>
      </section>

      {/* ── B2B section ── */}
      <section className="bg-[#0D1420] border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3">
            <BadgeLabel variant="amber">
              <Building2 size={10} /> Para Empresas
            </BadgeLabel>
            <h2 className="font-['Barlow_Condensed'] text-5xl font-bold text-foreground mt-4 mb-4 leading-tight">
              Gerencie toda a<br />conformidade do<br />
              <span className="text-amber-400">seu time.</span>
            </h2>
            <ul className="space-y-3 mb-8">
              {[
                "Dashboard exclusivo para gestores de RH",
                "Distribuição de vouchers por e-mail ou CSV",
                "Download em lote de certificados",
                "Relatórios de conformidade por setor",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onNavigate("b2b-register")}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-semibold rounded-md transition-colors flex items-center gap-2 w-fit"
            >
              Criar Conta B2B <ArrowRight size={16} />
            </button>
          </div>
          <div className="lg:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop&auto=format"
              alt="Gestor de RH"
              className="w-full rounded-lg object-cover h-72 lg:h-96 opacity-70"
            />
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-center text-xs text-muted-foreground font-mono tracking-widest uppercase mb-8">
          Empresas que confiam na plataforma
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="font-['Barlow_Condensed'] text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors tracking-wide"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ── Validator CTA ── */}
      <section className="bg-[#0D1420] border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <QrCode size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Verificar autenticidade de certificado
              </p>
              <p className="text-xs text-muted-foreground">Escaneie o QR Code ou insira o ID</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("validate")}
            className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <Globe size={14} /> Validar Certificado
          </button>
        </div>
      </section>
    </div>
  );
}
