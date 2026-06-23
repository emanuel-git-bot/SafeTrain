// ─── Admin Panel Shell ────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Shield, LayoutDashboard, BookOpen, BadgeCheck, GraduationCap,
  LineChart, Settings, Globe, LogOut, Bell, PanelLeftClose, PanelLeftOpen, Layers, Image
} from "lucide-react";
import { cn } from "../../lib/utils";
import { UserAvatar } from "../../components/ui/UserAvatar";
import { AdminDashboard } from "./AdminDashboard";
import { AdminCourses } from "./AdminCourses";
import { AdminCourseEditor } from "./AdminCourseEditor";
import { AdminCertificates } from "./AdminCertificates";
import { AdminCertificateTemplates } from "./AdminCertificateTemplates";
import { AdminClients } from "./AdminClients";
import { AdminAreas } from "./AdminAreas";
import { AdminMetrics } from "./AdminMetrics";
import { AdminSettings } from "./AdminSettings";
import { AdminCoupons } from "./AdminCoupons";
import { AdminPlans } from "./AdminPlans";
import type { View, AdminSection, AppUser } from "../../types";

export function AdminPanel({
  user,
  onNavigate,
  onLogout,
}: {
  user: AppUser | null;
  onNavigate: (v: View) => void;
  onLogout: () => void;
}) {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  // Parse permissions from JWT user
  const isSuperAdmin = !user?.permissions; // no restrictions = full access
  const adminPerms: string[] = (() => {
    if (!user?.permissions) return [];
    try { return JSON.parse(user.permissions); } catch { return []; }
  })();

  // Sections with their required permission key
  const allNavItems: { id: AdminSection | 'templates'; icon: React.ReactNode; label: string; permission?: string }[] = [
    { id: "dashboard",    icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { id: "courses",      icon: <BookOpen size={16} />,       label: "Cursos",           permission: "view_courses" },
    { id: "certificates", icon: <BadgeCheck size={16} />,    label: "Certificados",     permission: "view_certificates" },
    { id: "templates",    icon: <Image size={16} />,         label: "Templates",        permission: "view_certificates" },
    { id: "clients",      icon: <GraduationCap size={16} />, label: "Clientes",         permission: "view_clients" },
    { id: "coupons",      icon: <BadgeCheck size={16} />,    label: "Cupons",           permission: "view_coupons" },
    { id: "plans",        icon: <Layers size={16} />,        label: "Planos B2B",       permission: "view_plans" },
    { id: "areas",        icon: <Layers size={16} />,        label: "Áreas de Atuação", permission: "view_areas" },
    { id: "metrics",      icon: <LineChart size={16} />,     label: "Métricas",         permission: "view_metrics" },
    { id: "settings",     icon: <Settings size={16} />,      label: "Configurações",    permission: "view_settings" },
  ];

  // Always show dashboard; filter the rest by permissions
  const navItems = allNavItems.filter(item =>
    !item.permission || isSuperAdmin || adminPerms.includes(item.permission)
  );

  const renderSection = () => {
    if (section === "courses" && editingCourseId !== null) {
      return <AdminCourseEditor courseId={editingCourseId} onBack={() => setEditingCourseId(null)} />;
    }
    switch (section as any) {
      case "dashboard": return <AdminDashboard />;
      case "courses": return <AdminCourses onEdit={(id) => setEditingCourseId(id)} />;
      case "certificates": return <AdminCertificates />;
      case "templates": return <AdminCertificateTemplates />;
      case "clients": return <AdminClients />;
      case "coupons": return <AdminCoupons />;
      case "plans": return <AdminPlans />;
      case "areas": return <AdminAreas />;
      case "metrics": return <AdminMetrics />;
      case "settings": return <AdminSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-[#0D1420] border-r border-border transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-4 h-14 border-b border-border",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center shrink-0">
            <Shield size={14} className="text-[#090D18]" />
          </div>
          {!collapsed && (
            <span className="font-['Barlow_Condensed'] text-lg font-bold text-foreground">
              SafeTrain
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setEditingCourseId(null); }}
              title={collapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                section === item.id
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                collapsed && "justify-center px-2"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="px-2 py-3 border-t border-border space-y-0.5">
          <button
            onClick={() => onNavigate("landing")}
            title={collapsed ? "Ver site" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-sm",
              collapsed && "justify-center px-2"
            )}
          >
            <Globe size={15} className="shrink-0" />
            {!collapsed && <span>Ver site</span>}
          </button>
          <button
            onClick={onLogout}
            title={collapsed ? "Sair" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all text-sm",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-[#0D1420] border-b border-border flex items-center gap-4 px-6 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <div className="flex-1">
            <span className="text-xs font-mono text-muted-foreground">
              Admin / {navItems.find((n) => n.id === section)?.label}
              {editingCourseId !== null ? " / Editor" : ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <UserAvatar name="Rafael Souza" size="sm" />
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground leading-none">Rafael Souza</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{renderSection()}</main>
      </div>
    </div>
  );
}
