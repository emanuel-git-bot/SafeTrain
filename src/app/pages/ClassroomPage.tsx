import { useState, useEffect, useRef } from "react";
import {
  Clock, Play, Pause, Volume2, Maximize2, SkipForward, Lock,
  FileQuestion, CheckCircle2, XCircle, RotateCcw, Loader2
} from "lucide-react";
import { cn } from "../lib/utils";
import { BadgeLabel } from "../components/ui/BadgeLabel";
import { apiFetch } from "../lib/api";
import type { View } from "../types";

export function ClassroomPage({ enrollmentId, onNavigate }: { enrollmentId?: number | null, onNavigate: (v: View) => void }) {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [screenTime, setScreenTime] = useState(0);
  
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      if (!enrollmentId) {
        const data = await apiFetch("/users/me/enrollments").catch(()=>[]);
        if (data && data.length > 0) {
          fetchProgress(data[data.length - 1].id, true);
        } else {
          setLoading(false);
        }
      } else {
        fetchProgress(enrollmentId, true);
      }
    }
    load();
  }, [enrollmentId]);

  const fetchProgress = async (id: number, isInitialLoad = false) => {
    try {
      const res = await apiFetch(`/enrollments/${id}/progress`);
      setEnrollment(res.enrollment);
      setCourse(res.enrollment.course);
      setModules(res.enrollment.course.modules || []);
      setLogs(res.logs || []);
      
      if (isInitialLoad) {
        const completedIds = res.logs.filter((l: any) => l.completed).map((l: any) => l.moduleId);
        const firstIncomplete = (res.enrollment.course.modules || []).findIndex((m: any) => !completedIds.includes(m.id));
        if (firstIncomplete >= 0) setCurrentModuleIndex(firstIncomplete);
        else setCurrentModuleIndex(0);
      }
      
    } catch (err) {}
    setLoading(false);
  };

  const currentMod = modules[currentModuleIndex];
  const currentLog = logs.find(l => l.moduleId === currentMod?.id);
  const requiredTime = currentMod?.minScreenTime || 0;
  
  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setScreenTime(currentLog?.timeSpent || 0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    
    if (currentMod?.type === 'quiz' && currentLog?.completed) {
      setQuizSubmitted(true);
      setFinalScore(100);
    }
  }, [currentModuleIndex, currentMod, currentLog]);

  useEffect(() => {
    if (playing && currentMod?.type === 'video') {
      intervalRef.current = setInterval(() => {
        setProgress((p) => Math.min(p + 100 / 120, 100));
        setScreenTime((t) => {
          const newT = t + 1;
          if (newT % 5 === 0 && enrollment) {
             apiFetch(`/enrollments/${enrollment.id}/ping`, { 
               method: "POST", body: JSON.stringify({ moduleId: currentMod.id }) 
             })
             .then((res: any) => {
                if (res.completed && !currentLog?.completed) {
                  fetchProgress(enrollment.id);
                }
             })
             .catch(() => {});
          }
          return newT;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, currentMod, enrollment, currentLog]);

  const submitQuiz = async () => {
    if (!enrollment || !currentMod) return;
    setSubmittingQuiz(true);
    try {
      const res = await apiFetch(`/enrollments/${enrollment.id}/quiz`, {
         method: "POST", body: JSON.stringify({ moduleId: currentMod.id, answers: Object.values(quizAnswers) })
      });
      setFinalScore(res.score);
      setQuizSubmitted(true);
      if (res.passed) {
        if (currentModuleIndex === modules.length - 1) {
          await apiFetch(`/enrollments/${enrollment.id}/complete`, { method: "POST", body: "{}" });
        }
        await fetchProgress(enrollment.id);
      }
    } catch(err) {}
    setSubmittingQuiz(false);
  };

  const handleNextModule = async () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(i => i + 1);
    } else {
      await apiFetch(`/enrollments/${enrollment.id}/complete`, { method: "POST", body: "{}" });
      onNavigate("certificate");
    }
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-amber-400" /></div>;
  if (!enrollment || !course || !currentMod) return <div className="p-12 text-center">Matrícula não encontrada.</div>;

  const timePercent = requiredTime > 0 ? Math.min(Math.round((screenTime / requiredTime) * 100), 100) : 100;
  const isModuleCompleted = currentLog?.completed || false;
  
  let parsedQuestions: any[] = [];
  if (currentMod.type === 'quiz' && currentMod.questions) {
    try { parsedQuestions = JSON.parse(currentMod.questions); } catch(e){}
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h1 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground">
              {course.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              Módulo {currentModuleIndex + 1}: {currentMod.title}
            </p>
          </div>

          {currentMod.type === 'video' ? (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4 border border-white/5">
                {currentMod.videoUrl && (currentMod.videoUrl.includes('youtube.com') || currentMod.videoUrl.includes('youtu.be')) ? (
                  <iframe 
                    src={currentMod.videoUrl.includes('watch?v=') ? currentMod.videoUrl.replace('watch?v=', 'embed/') : currentMod.videoUrl.includes('youtu.be/') ? currentMod.videoUrl.replace('youtu.be/', 'youtube.com/embed/') : currentMod.videoUrl} 
                    className={cn("w-full h-full", !playing && "pointer-events-none opacity-50")}
                    allow="autoplay; fullscreen" 
                    allowFullScreen 
                  />
                ) : currentMod.videoUrl && (currentMod.videoUrl.endsWith('.mp4') || currentMod.videoUrl.endsWith('.webm')) ? (
                  <video 
                    src={currentMod.videoUrl} 
                    className={cn("w-full h-full object-contain", !playing && "opacity-50")}
                    controls={playing}
                    autoPlay={playing}
                  />
                ) : (
                  <img
                    src={currentMod.videoUrl || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1280&h=720&fit=crop&auto=format"}
                    alt="Vídeo"
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
                
                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                    <button
                      onClick={() => setPlaying(true)}
                      className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-amber-500/30"
                    >
                      <Play size={22} className="text-[#090D18] ml-1" />
                    </button>
                  </div>
                )}
                
                {!playing && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 pointer-events-none">
                    <div className="w-full bg-white/20 rounded-full h-1 mb-3">
                      <div className="bg-amber-400 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center gap-3 text-white text-sm">
                      <button>
                        <Play size={16} />
                      </button>
                      <Volume2 size={16} />
                      <span className="font-mono text-xs text-white/60 ml-auto">
                        {Math.floor(screenTime/60)}:{String(screenTime%60).padStart(2,'0')} / {Math.floor(requiredTime/60)}:{String(requiredTime%60).padStart(2,'0')}
                      </span>
                      <SkipForward size={16} />
                      <Maximize2 size={16} />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-amber-400" />
                    <span className="text-foreground font-medium">Tempo mínimo de tela</span>
                    {playing && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Registrando
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">
                    {Math.floor(screenTime / 60)}:{String(screenTime % 60).padStart(2, "0")} / {Math.floor(requiredTime/60)}:{String(requiredTime%60).padStart(2,'0')}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={cn("h-2 rounded-full transition-all", timePercent >= 100 ? "bg-emerald-400" : "bg-amber-400")} style={{ width: `${timePercent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {timePercent >= 100
                    ? "✓ Tempo mínimo atingido."
                    : `Assista mais ${Math.ceil((requiredTime - screenTime) / 60)} min para liberar o próximo passo.`}
                </p>
              </div>

              {isModuleCompleted && (
                <button
                  onClick={handleNextModule}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  Continuar
                </button>
              )}
            </>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6">
               <div className="mb-8">
                  <BadgeLabel variant="amber">
                    <FileQuestion size={10} /> Avaliação
                  </BadgeLabel>
                  <h1 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mt-3 mb-1">
                    {currentMod.title}
                  </h1>
                  <p className="text-muted-foreground text-sm">Nota de corte: {currentMod.passingScore || 70}%</p>
               </div>

               {!quizSubmitted ? (
                 <div className="space-y-6">
                   {parsedQuestions.map((q, qi) => (
                     <div key={qi} className="bg-muted/30 border border-border rounded-lg p-5">
                        <p className="font-medium text-foreground mb-4">{qi + 1}. {q.text}</p>
                        <div className="space-y-2">
                          {q.options.map((opt: string, oi: number) => (
                             <label key={oi} className="flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-white/5 transition-colors group">
                               <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", quizAnswers[qi] === oi ? "border-amber-400 bg-amber-400" : "border-muted-foreground")}>
                                 {quizAnswers[qi] === oi && <div className="w-1.5 h-1.5 rounded-full bg-[#090D18]" />}
                               </div>
                               <span className="text-sm text-slate-300">{opt}</span>
                               <input type="radio" className="sr-only" name={`q${qi}`} onChange={() => setQuizAnswers(a => ({ ...a, [qi]: oi }))} />
                             </label>
                          ))}
                        </div>
                     </div>
                   ))}
                   <button
                     onClick={submitQuiz}
                     disabled={Object.keys(quizAnswers).length < parsedQuestions.length || submittingQuiz}
                     className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                   >
                     {submittingQuiz ? <Loader2 className="animate-spin" size={16}/> : null} Enviar Respostas
                   </button>
                 </div>
               ) : (
                 <div className="text-center p-8">
                    {finalScore >= (currentMod.passingScore || 70) ? (
                      <>
                        <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
                        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-2">Aprovado!</h2>
                        <p className="text-emerald-400 font-mono text-sm mb-6">Nota Final: {finalScore}%</p>
                        <button onClick={handleNextModule} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-semibold rounded-md transition-colors flex items-center gap-2 mx-auto">
                           Continuar <SkipForward size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
                        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-2">Reprovado</h2>
                        <p className="text-muted-foreground mb-6">Nota mínima: {currentMod.passingScore || 70}% (Sua nota: {finalScore}%)</p>
                        <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-semibold rounded-md transition-colors flex items-center gap-2 mx-auto">
                          <RotateCcw size={16} /> Tentar novamente
                        </button>
                      </>
                    )}
                 </div>
               )}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-['Barlow_Condensed'] text-xl font-bold text-foreground mb-4">Módulos</h2>
          <div className="space-y-2">
            {modules.map((mod, i) => {
              const isLocked = i > 0 && !logs.find(l => l.moduleId === modules[i-1].id)?.completed;
              const isComp = logs.find(l => l.moduleId === mod.id)?.completed;
              return (
                <button
                  key={mod.id}
                  disabled={isLocked && i !== currentModuleIndex}
                  onClick={() => { if(!isLocked) setCurrentModuleIndex(i); }}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3",
                    i === currentModuleIndex ? "bg-amber-500/10 border-amber-500/30" : 
                    isLocked ? "bg-card border-border opacity-40 cursor-not-allowed" : "bg-card border-border hover:border-white/15"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold", isComp ? "bg-emerald-500/20 text-emerald-400" : i === currentModuleIndex ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground")}>
                    {isComp ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{mod.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                      {mod.type === 'video' ? <Play size={10} /> : <FileQuestion size={10} />}
                      {mod.type === 'video' ? 'Vídeo' : 'Avaliação'}
                    </p>
                  </div>
                  {isLocked && <Lock size={12} className="text-muted-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
