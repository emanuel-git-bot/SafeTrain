// ─── Admin: Course Editor ─────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  ArrowLeft, GripVertical, Video, FileQuestion, Trash2,
  Edit3, Settings, Upload, Globe, Plus, Image as ImageIcon
} from "lucide-react";
import { cn, getImageUrl } from "../../lib/utils";
import { api } from "../../lib/api";

export function AdminCourseEditor({ courseId, onBack }: { courseId: number; onBack: () => void }) {
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const selectedMod = modules.find((m) => m.id === selected);
  const [loading, setLoading] = useState(true);

  // Settings states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [validityMonths, setValidityMonths] = useState("");
  const [areaId, setAreaId] = useState("");
  const [certificateTemplateId, setCertificateTemplateId] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, areasRes, templatesRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get('/areas'),
        api.get('/admin/certificate-templates')
      ]);
      setCourse(courseRes.data);
      setModules(courseRes.data.modules || []);
      setSections(courseRes.data.courseSections || []);
      setAreas(areasRes.data);
      setTemplates(templatesRes.data || []);
      setTitle(courseRes.data.title);
      setPrice(courseRes.data.price);
      setDuration(courseRes.data.duration || "");
      setImage(courseRes.data.image || "");
      setValidityMonths(courseRes.data.validityMonths?.toString() || "");
      setAreaId(courseRes.data.areaId?.toString() || "");
      setCertificateTemplateId(courseRes.data.certificateTemplateId?.toString() || "");
      if (courseRes.data.modules?.length > 0) {
        setSelected(courseRes.data.modules[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const saveCourse = async () => {
    try {
      await api.put(`/admin/courses/${courseId}`, {
        title,
        price: Number(price),
        duration,
        image,
        validityMonths: validityMonths ? Number(validityMonths) : null,
        areaId: areaId ? Number(areaId) : null,
        certificateTemplateId: certificateTemplateId ? Number(certificateTemplateId) : null,
      });
      alert("Curso salvo com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar curso.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate loading state if necessary
      const res = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImage(res.data.url);
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer upload da imagem.");
    }
  };

  const togglePublish = async () => {
    if (!course) return;
    try {
      const newStatus = !course.published;
      await api.put(`/admin/courses/${courseId}`, {
        published: newStatus
      });
      setCourse({ ...course, published: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModule = async (type: "video" | "quiz") => {
    try {
      const res = await api.post(`/admin/courses/${courseId}/modules`, {
        title: type === "video" ? "Novo vídeo" : "Nova avaliação",
        type,
        order: modules.length + 1
      });
      setModules([...modules, res.data]);
      setSelected(res.data.id);
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar módulo");
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    try {
      await api.delete(`/admin/courses/${courseId}/modules/${moduleId}`);
      setModules(modules.filter(m => m.id !== moduleId));
      if (selected === moduleId) setSelected(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar módulo");
    }
  };

  const handleAddSection = async () => {
    try {
      const res = await api.post(`/admin/courses/${courseId}/sections`, { title: "Nova seção", order: sections.length + 1 });
      setSections([...sections, res.data]);
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar seção");
    }
  };

  const updateSectionTitle = (id: number, title: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, title } : s));
  };

  const saveSectionTitle = async (id: number, title: string) => {
    try {
      await api.put(`/admin/courses/${courseId}/sections/${id}`, { title });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    try {
      await api.delete(`/admin/courses/${courseId}/sections/${sectionId}`);
      setSections(sections.filter(s => s.id !== sectionId));
      fetchData(); // recarrega módulos e seções
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar seção");
    }
  };

  const updateSelectedMod = (data: any) => {
    setModules(ms => ms.map(m => m.id === selectedMod?.id ? { ...m, ...data } : m));
  };

  const handleSaveModule = async () => {
    if (!selectedMod) return;
    
    try {
      const updateData: any = {
        title: selectedMod.title,
        sectionId: selectedMod.sectionId ? Number(selectedMod.sectionId) : null,
      };

      if (selectedMod.type === "video") {
        updateData.videoUrl = selectedMod.videoUrl || "";
        updateData.minScreenTime = Number(selectedMod.minScreenTime || 0);
      } else {
        updateData.passingScore = Number(selectedMod.passingScore || 70);
        updateData.questions = JSON.stringify(selectedMod.parsedQuestions || []);
      }

      const res = await api.put(`/admin/courses/${courseId}/modules/${selectedMod.id}`, updateData);
      
      setModules(modules.map(m => m.id === selectedMod.id ? { ...m, ...res.data, parsedQuestions: selectedMod.parsedQuestions } : m));
      alert("Módulo salvo com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar módulo");
    }
  };

  // When selecting a module, ensure parsedQuestions exists for quiz
  useEffect(() => {
    if (selectedMod && selectedMod.type === "quiz" && !selectedMod.parsedQuestions) {
      let q = [];
      try {
        if (selectedMod.questions) q = JSON.parse(selectedMod.questions);
      } catch (e) { console.error(e); }
      
      setModules(ms => ms.map(m => m.id === selectedMod.id ? { ...m, parsedQuestions: q } : m));
    }
  }, [selected, selectedMod]);

  if (loading || !course) return <div className="p-6 text-muted-foreground">Carregando editor...</div>;

  const renderQuestionsEditor = () => {
    const questions = selectedMod.parsedQuestions || [];
    
    const addQuestion = () => {
      const newQ = { id: Date.now().toString(), text: "Nova questão", options: ["Opção A", "Opção B", "Opção C", "Opção D"], correctIndex: 0 };
      updateSelectedMod({ parsedQuestions: [...questions, newQ] });
    };

    const updateQuestion = (idx: number, data: any) => {
      const newQs = [...questions];
      newQs[idx] = { ...newQs[idx], ...data };
      updateSelectedMod({ parsedQuestions: newQs });
    };

    const deleteQuestion = (idx: number) => {
      const newQs = questions.filter((_, i) => i !== idx);
      updateSelectedMod({ parsedQuestions: newQs });
    };

    return (
      <div className="space-y-4 mt-4">
        {questions.map((q: any, qIdx: number) => (
          <div key={q.id || qIdx} className="p-4 border border-border rounded-lg bg-card/50 space-y-3">
            <div className="flex justify-between gap-2">
              <input
                value={q.text}
                onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
                className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-sm text-foreground focus:outline-none"
              />
              <button onClick={() => deleteQuestion(qIdx)} className="text-muted-foreground hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {q.options.map((opt: string, oIdx: number) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === oIdx}
                    onChange={() => updateQuestion(qIdx, { correctIndex: oIdx })}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[oIdx] = e.target.value;
                      updateQuestion(qIdx, { options: newOpts });
                    }}
                    className="flex-1 bg-muted/50 border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={addQuestion} className="w-full p-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:border-white/20 transition-colors flex items-center justify-center gap-1.5">
          <Plus size={10} /> Adicionar questão
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <div className="flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground bg-transparent border-none outline-none focus:ring-1 focus:ring-amber-500 rounded px-2 w-full"
            placeholder="Título do Curso"
          />
        </div>
        <button
          onClick={togglePublish}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-md transition-colors",
            course.published ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
          )}
        >
          {course.published ? "Despublicar" : "Publicar"}
        </button>
        <button
          onClick={saveCourse}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
        >
          Salvar curso
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Conteúdo</h3>
            <div className="flex gap-1">
              <button
                onClick={handleAddSection}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border text-xs text-foreground rounded hover:border-white/20 transition-colors"
              >
                <Plus size={10} /> Seção
              </button>
              <button
                onClick={() => handleAddModule("video")}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border text-xs text-foreground rounded hover:border-white/20 transition-colors"
              >
                <Video size={10} /> Vídeo
              </button>
              <button
                onClick={() => handleAddModule("quiz")}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border text-xs text-foreground rounded hover:border-white/20 transition-colors"
              >
                <FileQuestion size={10} /> Quiz
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((sec) => (
              <div key={sec.id} className="space-y-1.5">
                <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded border border-white/10 gap-2">
                  <input
                    value={sec.title}
                    onChange={(e) => updateSectionTitle(sec.id, e.target.value)}
                    onBlur={() => saveSectionTitle(sec.id, sec.title)}
                    className="bg-transparent text-xs font-semibold text-amber-400 focus:outline-none border-b border-transparent focus:border-amber-400 w-full flex-1"
                  />
                  <button onClick={() => handleDeleteSection(sec.id)} className="text-muted-foreground hover:text-red-400 shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
                {modules.filter(m => m.sectionId === sec.id).map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => setSelected(mod.id)}
                    className={cn(
                      "flex items-center gap-2.5 p-3 ml-4 rounded-lg border cursor-pointer transition-all group",
                      selected === mod.id
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-card border-border hover:border-white/15"
                    )}
                  >
                    <GripVertical size={12} className="text-muted-foreground shrink-0" />
                    <div
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center shrink-0",
                        mod.type === "video" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"
                      )}
                    >
                      {mod.type === "video" ? <Video size={10} /> : <FileQuestion size={10} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{mod.title}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(mod.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ))}

            {modules.filter(m => !m.sectionId).length > 0 && (
              <div className="space-y-1.5">
                <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Módulos Avulsos</div>
                {modules.filter(m => !m.sectionId).map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => setSelected(mod.id)}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all group",
                      selected === mod.id
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-card border-border hover:border-white/15"
                    )}
                  >
                    <GripVertical size={12} className="text-muted-foreground shrink-0" />
                    <div
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center shrink-0",
                        mod.type === "video" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"
                      )}
                    >
                      {mod.type === "video" ? <Video size={10} /> : <FileQuestion size={10} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{mod.title}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(mod.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor area */}
        <div className="lg:col-span-2 space-y-4">
          {selectedMod && (
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Edit3 size={13} className="text-amber-400" /> Editando módulo
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-1.5">TÍTULO</label>
                    <input
                      value={selectedMod.title}
                      onChange={(e) => updateSelectedMod({ title: e.target.value })}
                      className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-1.5">SEÇÃO (CATEGORIA)</label>
                    <select
                      value={selectedMod.sectionId || ""}
                      onChange={(e) => updateSelectedMod({ sectionId: e.target.value ? Number(e.target.value) : null })}
                      className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">(Nenhuma)</option>
                      {sections.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedMod.type === "video" ? (
                  <>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground block mb-1.5">URL DO VÍDEO</label>
                      <input
                        value={selectedMod.videoUrl || ""}
                        onChange={(e) => updateSelectedMod({ videoUrl: e.target.value })}
                        placeholder="Ex: https://youtube.com/watch?v=..."
                        className="w-full bg-muted border border-border rounded-md px-4 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground block mb-1.5">TEMPO MÍNIMO (min)</label>
                      <input
                        type="number"
                        value={selectedMod.minScreenTime || 0}
                        onChange={(e) => updateSelectedMod({ minScreenTime: Number(e.target.value) })}
                        className="w-24 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                        NOTA DE CORTE — {selectedMod.passingScore || 70}%
                      </label>
                      <input
                        type="range"
                        min={50}
                        max={100}
                        step={5}
                        value={selectedMod.passingScore || 70}
                        onChange={(e) => updateSelectedMod({ passingScore: Number(e.target.value) })}
                        className="w-full accent-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground block mb-2">QUESTÕES</label>
                      {renderQuestionsEditor()}
                    </div>
                  </>
                )}

                <div className="flex items-center justify-end pt-2 border-t border-border">
                  <button onClick={handleSaveModule} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-xs font-semibold rounded-md transition-colors">
                    Salvar módulo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Settings size={13} className="text-amber-400" /> Configurações
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">PREÇO (R$)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">CARGA HORÁRIA</label>
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex: 8h"
                  className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">VALIDADE DO CERT. (Meses)</label>
                <input
                  type="number"
                  value={validityMonths}
                  onChange={(e) => setValidityMonths(e.target.value)}
                  placeholder="Ex: 24 (Deixe vazio p/ não expirar)"
                  className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">ÁREA</label>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="">Selecione uma área</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name || a.label || a.id}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">TEMPLATE DE CERTIFICADO</label>
                <select
                  value={certificateTemplateId}
                  onChange={(e) => setCertificateTemplateId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="">Sem certificado (Padrão)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">IMAGEM DE CAPA</label>
                <div className="flex gap-4">
                  <div className="w-24 h-16 bg-slate-800 rounded-md overflow-hidden shrink-0 border border-border">
                    <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="URL ou ID da Imagem"
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-md text-xs font-medium text-foreground hover:border-white/20 transition-colors"
                      >
                        <Upload size={12} /> Fazer Upload
                      </label>
                      <span className="text-xs text-muted-foreground">Recomendado: 800x600px</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
