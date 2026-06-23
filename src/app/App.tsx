// ─── App — Root Router ────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Shield, QrCode } from "lucide-react";
import { Nav } from "./components/layout/Nav";
import { EnrollModal } from "./components/modals/EnrollModal";
import { LandingPage } from "./pages/LandingPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ClassroomPage } from "./pages/ClassroomPage";
import { CertificatePage } from "./pages/CertificatePage";
import { CertificateValidator } from "./pages/CertificateValidator";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { B2BRegisterPage } from "./pages/B2BRegisterPage";
import { MyPanel } from "./pages/MyPanel";
import { B2BDashboard } from "./pages/B2BDashboard";
import { MyProfile } from "./pages/MyProfile";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { COURSES } from "./data/mockData";
import { api } from "./lib/api";
import type { View, AppUser } from "./types";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<AppUser | null>(null);
  const [enrollCourse, setEnrollCourse] = useState<any>(null);
  const [activeEnrollmentId, setActiveEnrollmentId] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      api.get('/users/me')
        .then(res => {
          if (res.data) {
            setUser(res.data);
          }
        })
        .catch(err => {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('jwt_token');
        })
        .finally(() => {
          setLoadingUser(false);
        });
    } else {
      setLoadingUser(false);
    }
  }, []);

  const handleEnroll = (course: (typeof COURSES)[0]) => {
    if (!user) { setView("login"); return; }
    setEnrollCourse(course);
  };
  const handleLogin = (u: AppUser) => setUser(u);
  const handleLogout = () => { localStorage.removeItem('jwt_token'); setUser(null); setView("landing"); };

  if (loadingUser) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  const renderView = () => {
    switch (view) {
      case "landing":    return <LandingPage onNavigate={setView} onEnroll={handleEnroll} />;
      case "catalog":    return <CatalogPage onEnroll={handleEnroll} />;
      case "classroom":  return <ClassroomPage enrollmentId={activeEnrollmentId} onNavigate={setView} />;
      case "certificate":return <CertificatePage enrollmentId={activeEnrollmentId} onNavigate={setView} />;
      case "validate":   return <CertificateValidator />;
      case "login":      return <LoginPage onNavigate={setView} onLogin={handleLogin} />;
      case "register":   return <RegisterPage onNavigate={setView} onLogin={handleLogin} />;
      case "b2b-register": return <B2BRegisterPage onNavigate={setView} onLogin={handleLogin} />;
      case "b2b":        return user ? <B2BDashboard user={user} /> : <LoginPage onNavigate={setView} onLogin={handleLogin} />;
      case "my-panel":   return user ? <MyPanel user={user} onNavigate={setView} onSelectEnrollment={setActiveEnrollmentId} /> : <LoginPage onNavigate={setView} onLogin={handleLogin} />;
      case "my-certificates": return user ? <MyPanel user={user} onNavigate={setView} onSelectEnrollment={setActiveEnrollmentId} initialTab="completed" /> : <LoginPage onNavigate={setView} onLogin={handleLogin} />;
      case "my-profile": return user ? <MyProfile user={user} onNavigate={setView} onUpdateUser={setUser} /> : <LoginPage onNavigate={setView} onLogin={handleLogin} />;
      case "admin":      return <AdminPanel user={user} onNavigate={setView} onLogout={handleLogout} />;
    }
  };

  if (view === "admin") return <>{renderView()}</>;

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Nav view={view} user={user} onNavigate={setView} onLogout={handleLogout} />
      <main>{renderView()}</main>

      {enrollCourse && (
        <EnrollModal
          course={enrollCourse}
          onClose={() => setEnrollCourse(null)}
          onSuccess={(eid) => { 
            setEnrollCourse(null); 
            setActiveEnrollmentId(eid);
            setView("classroom"); 
          }}
        />
      )}

      {view === "landing" && (
        <footer className="border-t border-border py-8 mt-4">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-amber-400 rounded flex items-center justify-center">
                <Shield size={11} className="text-[#090D18]" />
              </div>
              <span className="font-['Barlow_Condensed'] font-bold text-foreground">SafeTrain</span>
              <span className="text-muted-foreground text-xs font-mono">© 2024</span>
            </div>
            <div className="flex gap-5 text-xs text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Termos de Uso</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacidade</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Suporte</span>
              <button
                onClick={() => setView("validate")}
                className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <QrCode size={11} /> Verificar certificado
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
