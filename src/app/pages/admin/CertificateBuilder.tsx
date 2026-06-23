import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { ArrowLeft, Save, Image as ImageIcon, Plus, Eye } from 'lucide-react';
import { apiFetch } from '../../lib/api';

type ElementType = 'student_name' | 'course_name' | 'issue_date' | 'workload' | 'validation_code' | 'qr_code' | 'static_text';

interface CertElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  size?: number; // for qrcode
  text?: string; // for static text
  color?: string;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
}

export function CertificateBuilder({ templateId, initialTemplate, onBack }: { templateId: number, initialTemplate?: any, onBack: () => void }) {
  const [template, setTemplate] = useState<any>(initialTemplate || null);
  const [elements, setElements] = useState<CertElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (!template) {
      apiFetch(`/admin/certificate-templates`).then(res => {
        const t = res.find((x: any) => x.id === templateId);
        if (t) initTemplate(t);
      });
    } else {
      initTemplate(template);
    }
  }, [templateId]);

  const initTemplate = (t: any) => {
    setTemplate(t);
    if (t.elements) {
      try {
        setElements(JSON.parse(t.elements));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`/admin/certificate-templates/${templateId}`, {
        method: 'PUT',
        body: JSON.stringify({
          backgroundImageUrl: template.backgroundImageUrl,
          elements: JSON.stringify(elements)
        })
      });
      alert('Layout salvo com sucesso!');
    } catch (err) {
      alert('Erro ao salvar');
    }
    setSaving(false);
  };

  const preview = async () => {
    setPreviewing(true);
    try {
      // Use apiFetch to get the raw response by using a custom function or raw fetch with correct API_URL
      const token = localStorage.getItem('jwt_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const res = await fetch(`${API_URL}/admin/certificate-templates/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          backgroundImageUrl: template?.backgroundImageUrl,
          elements: JSON.stringify(elements)
        })
      });
      if (!res.ok) throw new Error('Falha ao gerar preview');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      alert('Erro ao gerar preview');
    }
    setPreviewing(false);
  };

  const addElement = (type: ElementType) => {
    const newEl: CertElement = {
      id: Math.random().toString(36).substring(7),
      type,
      x: 350,
      y: 250,
      fontSize: type === 'qr_code' ? undefined : 24,
      fontFamily: type === 'qr_code' ? undefined : 'Helvetica',
      fontWeight: type === 'qr_code' ? undefined : 'normal',
      color: type === 'qr_code' ? undefined : '#000000',
      size: type === 'qr_code' ? 100 : undefined,
      textAlign: 'left',
      text: type === 'static_text' ? 'Texto' : undefined
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (id: string, changes: Partial<CertElement>) => {
    setElements(elements.map(e => e.id === id ? { ...e, ...changes } : e));
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedElement = elements.find(e => e.id === selectedId);

  // Scaling logic to fit the 842x595 canvas in the viewport
  // For simplicity, we just apply a fixed scale on small screens or let it scroll.
  // 842 x 595 points = exactly A4 landscape
  
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -mx-6 -my-6 bg-muted/30">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-foreground">Editor: {template?.name}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={preview} disabled={previewing} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-semibold text-sm rounded-md hover:bg-secondary/80">
            <Eye size={16} /> {previewing ? 'Carregando...' : 'Ver Prévia'}
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold text-sm rounded-md hover:bg-amber-400">
            <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Layout'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto shrink-0 flex flex-col gap-6">
          
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fundo</h3>
            <label className="block text-sm text-foreground mb-1">URL da Imagem Fundo</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={template?.backgroundImageUrl || ''} 
                onChange={e => setTemplate({...template, backgroundImageUrl: e.target.value})}
                placeholder="https://..."
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">A imagem deve estar em proporção A4 (297x210mm).</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Adicionar Elementos</h3>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => addElement('student_name')} className="text-left px-3 py-2 text-sm bg-background border border-border rounded hover:border-amber-500 transition-colors">+ Nome do Aluno</button>
              <button onClick={() => addElement('course_name')} className="text-left px-3 py-2 text-sm bg-background border border-border rounded hover:border-amber-500 transition-colors">+ Nome do Curso</button>
              <button onClick={() => addElement('issue_date')} className="text-left px-3 py-2 text-sm bg-background border border-border rounded hover:border-amber-500 transition-colors">+ Data de Emissão</button>
              <button onClick={() => addElement('workload')} className="text-left px-3 py-2 text-sm bg-background border border-border rounded hover:border-amber-500 transition-colors">+ Carga Horária</button>
              <button onClick={() => addElement('validation_code')} className="text-left px-3 py-2 text-sm bg-background border border-border rounded hover:border-amber-500 transition-colors">+ Código Validação</button>
              <button onClick={() => addElement('qr_code')} className="text-left px-3 py-2 text-sm bg-background border border-border rounded hover:border-amber-500 transition-colors">+ QR Code</button>
              <button onClick={() => addElement('static_text')} className="text-left px-3 py-2 text-sm bg-background border border-border rounded hover:border-amber-500 transition-colors">+ Texto Fixo</button>
            </div>
          </div>

        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[#e5e5e5] dark:bg-[#1a1a1a]">
          {/* A4 Canvas 842x595 */}
          <div 
            className="relative shadow-2xl bg-white shrink-0 overflow-hidden"
            style={{ width: 842, height: 595 }}
            onClick={() => setSelectedId(null)}
          >
            {template?.backgroundImageUrl && (
              <img src={template.backgroundImageUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            )}

            {elements.map(el => (
              <Rnd
                key={el.id}
                bounds="parent"
                position={{ x: el.x, y: el.y }}
                onDrag={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                enableResizing={false}
                onClick={(e: any) => { e.stopPropagation(); setSelectedId(el.id); }}
                className={`flex items-center justify-center border-2 ${selectedId === el.id ? 'border-blue-500 border-dashed bg-blue-500/10' : 'border-transparent hover:border-gray-300 hover:border-dashed'}`}
                style={{ cursor: 'move', zIndex: selectedId === el.id ? 10 : 1 }}
              >
                {el.type === 'qr_code' ? (
                  <div className="bg-black/10 flex items-center justify-center text-xs font-bold text-black/50" style={{ width: el.size || 100, height: el.size || 100 }}>QR CODE</div>
                ) : (
                  <div style={{ 
                    fontSize: el.fontSize, 
                    textAlign: el.textAlign, 
                    color: el.color || '#000', 
                    fontFamily: el.fontFamily || 'Helvetica',
                    fontWeight: el.fontWeight || 'normal',
                    whiteSpace: 'nowrap', 
                    width: '100%' 
                  }}>
                    {el.type === 'student_name' ? '[ Nome do Aluno ]' :
                     el.type === 'course_name' ? '[ Nome do Curso ]' :
                     el.type === 'issue_date' ? '[ Data ]' :
                     el.type === 'workload' ? '[ Horas ]' :
                     el.type === 'validation_code' ? '[ Codigo: PREVIEW-123 ]' :
                     el.text}
                  </div>
                )}
              </Rnd>
            ))}
          </div>
        </div>

        {/* Right Properties Panel */}
        {selectedElement && (
          <div className="w-64 border-l border-border bg-card p-4 overflow-y-auto shrink-0 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Propriedades</h3>
              <button onClick={() => removeElement(selectedElement.id)} className="text-xs text-red-500 hover:underline">Remover</button>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Tamanho da Fonte (pt)</label>
              <input 
                type="number" 
                value={selectedElement.fontSize || 16}
                onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
              />
            </div>

            {selectedElement.type !== 'qr_code' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Cor</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={selectedElement.color || '#000000'}
                        onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                        className="w-8 h-8 rounded border border-border cursor-pointer p-0"
                      />
                      <span className="text-xs">{selectedElement.color || '#000000'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Negrito</label>
                    <label className="flex items-center gap-2 mt-2">
                      <input 
                        type="checkbox"
                        checked={selectedElement.fontWeight === 'bold'}
                        onChange={e => updateElement(selectedElement.id, { fontWeight: e.target.checked ? 'bold' : 'normal' })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Bold</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Fonte</label>
                  <select 
                    value={selectedElement.fontFamily || 'Helvetica'}
                    onChange={e => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times">Times Roman</option>
                    <option value="Courier">Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Alinhamento</label>
                  <select 
                    value={selectedElement.textAlign || 'left'}
                    onChange={e => updateElement(selectedElement.id, { textAlign: e.target.value as any })}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
                  >
                    <option value="left">Esquerda</option>
                    <option value="center">Centralizado</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </>
            )}

            {selectedElement.type === 'qr_code' && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Tamanho (Largura/Altura)</label>
                <input 
                  type="number" 
                  value={selectedElement.size || 100}
                  onChange={e => updateElement(selectedElement.id, { size: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
                />
              </div>
            )}

            {selectedElement.type === 'static_text' && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Texto</label>
                <textarea 
                  value={selectedElement.text || ''}
                  onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
                  rows={3}
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
