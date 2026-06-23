// ─── Certificate Page ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Shield, Award, Eye, Download } from "lucide-react";
import { QRCodeSVG } from "../components/ui/QRCodeSVG";
import { apiFetch } from "../lib/api";
import type { View } from "../types";

export function CertificatePage({ onNavigate, enrollmentId }: { onNavigate: (v: View) => void, enrollmentId?: number | null }) {
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const enrolls = await apiFetch("/users/me/enrollments");
        // Find the specific enrollment, or fallback to the first completed one
        const targetEnrollment = enrollmentId 
          ? enrolls.find((e: any) => e.id === enrollmentId)
          : enrolls.find((e: any) => e.status === 'completed');
          
        if (targetEnrollment) {
           setEnrollment(targetEnrollment);
           if (targetEnrollment.certificates && targetEnrollment.certificates.length > 0) {
             setCert(targetEnrollment.certificates[0]);
           } else {
             // Fallback to enrollment info
             setCert({ id: 'Pendente', user: { name: "Usuário Logado" }, course: targetEnrollment.course });
           }
        }
      } catch (err) {}
      setLoading(false);
    }
    load();
  }, [enrollmentId]);

  const downloadPdf = async () => {
    if (!enrollment) {
      alert('Matrícula não encontrada.');
      return;
    }
    try {
      const token = localStorage.getItem('jwt_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const res = await fetch(`${API_URL}/enrollments/${enrollment.id}/certificate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || 'Falha ao gerar o PDF');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Certificado_${cert?.code || enrollment.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Erro ao baixar PDF:', err);
      alert('Erro ao baixar o PDF: ' + (err.message || 'Tente novamente.'));
    }
  };

  if (loading) return <div className="text-white p-10">Carregando...</div>;
  if (!enrollment) return <div className="text-white p-10">Você ainda não possui certificados.</div>;

  const certId = cert?.code || cert?.id || "Pendente";
  const template = enrollment?.course?.certificateTemplate;
  
  let elements = null;
  if (template?.elements) {
    try { elements = JSON.parse(template.elements); } catch(e) {}
  }
  
  // se template existe mas não tem elementos, injetar os defaults
  if (template && (!elements || elements.length === 0)) {
    elements = [
      { id: '1', type: 'student_name', x: 421, y: 300, fontSize: 36, textAlign: 'center' },
      { id: '2', type: 'course_name', x: 421, y: 250, fontSize: 24, textAlign: 'center' },
      { id: '3', type: 'issue_date', x: 421, y: 200, fontSize: 16, textAlign: 'center' },
      { id: '4', type: 'qr_code', x: 50, y: 50, size: 100 },
      { id: '5', type: 'validation_code', x: 50, y: 30, fontSize: 12 }
    ];
  }
  const issueDate = cert?.createdAt ? new Date(cert.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] text-4xl font-bold text-foreground">
            Seu Certificado
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Parabéns pela conclusão do curso</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate("validate")}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm font-medium text-foreground rounded-md hover:border-white/20 transition-colors"
          >
            <Eye size={14} /> Verificar
          </button>
          <button onClick={downloadPdf} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors">
            <Download size={14} /> Baixar PDF
          </button>
        </div>
      </div>

      {template && elements ? (
        <div className="w-full flex justify-center bg-transparent rounded-xl overflow-x-auto">
          <div 
            className="relative shadow-2xl bg-white shrink-0 overflow-hidden"
            style={{ 
              width: 842, 
              height: 595,
              transform: 'scale(1)', 
              transformOrigin: 'top center',
            }}
          >
            {template?.backgroundImageUrl && (
              <img src={template.backgroundImageUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            )}
            {elements.map((el: any) => (
              <div
                key={el.id}
                className="absolute flex items-center justify-center pointer-events-none"
                style={{ left: el.x, top: el.y, zIndex: 10 }}
              >
                {el.type === 'qr_code' ? (
                  <div style={{ width: el.size || 100, height: el.size || 100 }}>
                    <QRCodeSVG value={`https://safetrain.com.br/validar/${certId}`} />
                  </div>
                ) : (
                  <div style={{ 
                    fontSize: el.fontSize, 
                    textAlign: el.textAlign, 
                    color: el.color || '#000', 
                    fontFamily: el.fontFamily || 'Helvetica',
                    fontWeight: el.fontWeight || 'normal',
                    whiteSpace: 'nowrap', 
                    width: el.textAlign === 'center' ? '100%' : 'auto',
                    transform: el.textAlign === 'center' ? 'translateX(-50%)' : 'none'
                  }}>
                    {el.type === 'student_name' ? (cert?.user?.name || "Usuário Logado") :
                     el.type === 'course_name' ? (cert?.course?.title || "Curso") :
                     el.type === 'issue_date' ? issueDate :
                     el.type === 'workload' ? `${cert?.course?.duration || 8} horas` :
                     el.type === 'validation_code' ? certId :
                     el.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="bg-[#090D18] px-10 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 rounded flex items-center justify-center">
                <Shield size={20} className="text-[#090D18]" />
              </div>
              <div>
                <p className="text-white font-['Barlow_Condensed'] text-lg font-bold leading-none">
                  SafeTrain
                </p>
                <p className="text-slate-400 text-xs font-mono">Plataforma de Treinamentos EPI</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-mono">Certificado Nº</p>
              <p className="text-amber-400 text-sm font-mono font-medium">{certId}</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-10 py-10 bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="text-center mb-8">
              <p className="text-slate-500 text-sm font-mono uppercase tracking-widest mb-3">
                Certificamos que
              </p>
              <h2 className="font-['Barlow_Condensed'] text-5xl font-black text-slate-900 mb-4">
                {cert.user?.name || "Usuário Logado"}
              </h2>
              <p className="text-slate-500 text-base">concluiu com aprovação o curso de</p>
              <h3 className="font-['Barlow_Condensed'] text-3xl font-bold text-[#090D18] mt-2 mb-1">
                {cert.course?.title || "NR-35: Trabalho em Altura"}
              </h3>
              <p className="text-slate-400 text-sm">
                carga horária de <strong className="text-slate-600">{cert.course?.duration || 8} horas</strong> · nota{" "}
                <strong className="text-slate-600">100%</strong>
              </p>
            </div>

            <div className="flex items-end justify-between pt-8 border-t border-slate-200">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 w-40">
                  <p className="text-xs font-['Barlow_Condensed'] text-slate-900 font-bold">
                    Dr. Rafael Souza
                  </p>
                </div>
                <p className="text-xs text-slate-400 font-mono">Coordenador Pedagógico</p>
                <p className="text-xs text-slate-400 font-mono mt-2">
                  Emitido: {issueDate}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-1">
                  <QRCodeSVG value={`/validar/${certId}`} />
                </div>
                <p className="text-xs text-slate-400 font-mono">Verificar autenticidade</p>
              </div>

              <div className="text-right w-40">
                <div className="w-16 h-16 ml-auto mb-2 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center">
                  <Award size={28} className="text-amber-500" />
                </div>
                <p className="text-xs text-slate-500 font-mono">Reconhecido pelo MTE</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground font-mono mt-6">
        Autenticidade:{" "}
        <span className="text-amber-400">safetrain.com.br/validar/{certId}</span>
      </p>
    </div>
  );
}
