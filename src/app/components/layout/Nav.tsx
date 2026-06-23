// ─── Navigation Bar ──────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Shield, Menu, X, ChevronDown, User, Award, Settings, LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { UserAvatar } from "../ui/UserAvatar";
import type { View, AppUser } from "../../types";

export function Nav({
  view,
  user,
  onNavigate,
  onLogout,
}: {
  view: View;
  user: AppUser | null;
  onNavigate: (v: View) => void;
  onLogout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (view === "admin" || view === "login" || view === "register") return null;

  const links: { label: string; view: View }[] = [
    { label: "Catálogo", view: "catalog" },
    ...((!user || user.role === "company") ? [{ label: "Para Empresas", view: (!user ? "b2b-register" : "b2b") as View }] : []),
    { label: "Verificar Cert.", view: "validate" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#090D18]/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center">
            <Shield size={15} className="text-[#090D18]" />
          </div>
          <span className="font-['Barlow_Condensed'] text-xl font-bold text-foreground tracking-wide">
            SafeTrain
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {links.map((l) => (
            <button
              key={l.view}
              onClick={() => onNavigate(l.view)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-md transition-colors",
                view === l.view
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Desktop user area */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => onNavigate("my-panel")}
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors border",
                  view === "my-panel"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-foreground"
                )}
              >
                Meu Painel
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-md hover:border-white/20 transition-colors"
                >
                  <UserAvatar name={user.name} size="sm" />
                  <span className="text-sm text-foreground font-medium">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown size={13} className="text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { onNavigate("my-panel"); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors flex items-center gap-2.5"
                      >
                        <User size={14} className="text-muted-foreground" /> Meu Painel
                      </button>
                      <button
                        onClick={() => { onNavigate("my-profile"); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors flex items-center gap-2.5"
                      >
                        <Settings size={14} className="text-muted-foreground" /> Meu Perfil
                      </button>
                      <button
                        onClick={() => { onNavigate("my-certificates"); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors flex items-center gap-2.5"
                      >
                        <Award size={14} className="text-muted-foreground" /> Certificados
                      </button>
                      {user.role === "admin" && (
                        <button
                          onClick={() => { onNavigate("admin"); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors flex items-center gap-2.5"
                        >
                          <Shield size={14} className="text-amber-400" /> Painel Admin
                        </button>
                      )}
                    </div>
                    <div className="py-1 border-t border-border">
                      <button
                        onClick={() => { onLogout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors flex items-center gap-2.5"
                      >
                        <LogOut size={14} /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate("login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => onNavigate("register")}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
              >
                Começar
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-[#090D18] px-6 py-4 space-y-1">
          {links.map((l) => (
            <button
              key={l.view}
              onClick={() => { onNavigate(l.view); setMobileOpen(false); }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm rounded-md transition-colors",
                view === l.view
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </button>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            {user ? (
              <>
                <button
                  onClick={() => { onNavigate("my-panel"); setMobileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground"
                >
                  Meu Painel
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onNavigate("login"); setMobileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-muted-foreground"
                >
                  Entrar
                </button>
                <button
                  onClick={() => { onNavigate("register"); setMobileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-amber-400"
                >
                  Cadastrar-se
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
