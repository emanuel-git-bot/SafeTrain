import { useState, useEffect } from "react";
import { X, Clock, Layers, Star, Users, Award, PlayCircle, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { getImageUrl } from "../../lib/utils";
import { BadgeLabel } from "../ui/BadgeLabel";

export function CourseShowcaseModal({ courseId, onClose, onEnroll }: { courseId: number, onClose: () => void, onEnroll: () => void }) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/courses/${courseId}`);
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="text-white">Carregando detalhes...</div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0f1423] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-white/10 overflow-hidden">
        
        {/* Banner header */}
        <div className="relative h-64 sm:h-72 bg-black shrink-0">
          <img
            src={getImageUrl(course.image)}
            alt={course.title}
            className="w-full h-full object-cover opacity-60"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex gap-2 mb-3">
              {course.level && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded uppercase tracking-wider">
                  {course.level}
                </span>
              )}
              {course.certificateTemplateId && (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded uppercase tracking-wider flex items-center gap-1">
                  <Award size={12} /> Com Certificado
                </span>
              )}
            </div>
            <h2 className="font-['Barlow_Condensed'] text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
              {course.title}
            </h2>
            <div className="flex items-center gap-6 text-sm text-slate-300 font-mono">
              <span className="flex items-center gap-2"><Clock size={16} className="text-amber-400" /> {course.duration || 'N/A'}</span>
              <span className="flex items-center gap-2"><Layers size={16} className="text-amber-400" /> {course.modules?.length || 0} aulas</span>
              {course.validityMonths && (
                <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-amber-400" /> Validade: {course.validityMonths} meses</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-8 border-r border-white/5">
            <h3 className="text-xl font-semibold text-white mb-4">Sobre o Curso</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {course.description || "Nenhuma descrição fornecida."}
            </p>

            <h3 className="text-xl font-semibold text-white mb-4">Conteúdo Programático</h3>
            <div className="space-y-6">
              {course.courseSections && course.courseSections.length > 0 ? (
                course.courseSections.map((sec: any) => (
                  <div key={sec.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <div className="bg-white/5 px-4 py-3 font-medium text-amber-400 text-sm border-b border-white/10">
                      {sec.title}
                    </div>
                    <div className="divide-y divide-white/5">
                      {sec.modules?.map((m: any) => (
                        <div key={m.id} className="px-4 py-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3 text-slate-300">
                            <PlayCircle size={16} className="text-slate-500" />
                            {m.title}
                          </div>
                          <span className="text-slate-500 font-mono text-xs">{m.duration || '0:00'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-lg divide-y divide-white/5">
                  {course.modules?.map((m: any) => (
                    <div key={m.id} className="px-4 py-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-slate-300">
                        <PlayCircle size={16} className="text-slate-500" />
                        {m.title}
                      </div>
                      <span className="text-slate-500 font-mono text-xs">{m.duration || '0:00'}</span>
                    </div>
                  ))}
                  {(!course.modules || course.modules.length === 0) && (
                    <div className="px-4 py-6 text-center text-slate-500 text-sm">Nenhum conteúdo cadastrado</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-72 bg-black/20 p-8 flex flex-col shrink-0">
            <div className="mb-8">
              <p className="text-slate-400 text-sm mb-1 font-mono">Investimento</p>
              <div className="font-['Barlow_Condensed'] text-4xl font-bold text-amber-400">
                R$ {course.price}
              </div>
            </div>
            
            <button
              onClick={onEnroll}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-bold rounded-lg transition-colors mb-4 text-lg"
            >
              Matricular Agora
            </button>
            <p className="text-xs text-slate-500 text-center">
              Você pode usar um voucher na próxima etapa.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
