import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { CertificateBuilder } from './CertificateBuilder';

export function AdminCertificateTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  useEffect(() => {
    if (editingTemplateId === null) {
      loadTemplates();
    }
  }, [editingTemplateId]);

  const loadTemplates = async () => {
    try {
      const data = await apiFetch('/admin/certificate-templates');
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNew = async () => {
    const name = prompt('Nome do Template (ex: Fundo Escuro Premium):');
    if (!name) return;
    try {
      const res = await apiFetch('/admin/certificate-templates', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      setEditingTemplateId(res.id);
    } catch (err) {
      alert('Erro ao criar template');
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este template? Ele pode estar em uso por cursos.')) return;
    try {
      await apiFetch(`/admin/certificate-templates/${id}`, { method: 'DELETE' });
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      alert('Erro ao deletar (Pode estar associado a um curso)');
    }
  };

  const [showPrompt, setShowPrompt] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  if (editingTemplateId !== null) {
    const template = templates.find(t => t.id === editingTemplateId);
    return <CertificateBuilder templateId={editingTemplateId} initialTemplate={template} onBack={() => setEditingTemplateId(null)} />;
  }

  if (loading) return <div className="p-8 text-foreground">Carregando templates...</div>;

  const handleCreate = async () => {
    if (!newTemplateName.trim()) return;
    try {
      const res = await apiFetch('/admin/certificate-templates', {
        method: 'POST',
        body: JSON.stringify({ name: newTemplateName })
      });
      setTemplates([...templates, res]);
      setEditingTemplateId(res.id);
      setShowPrompt(false);
      setNewTemplateName('');
    } catch (err) {
      alert('Erro ao criar template');
    }
  };

  return (
    <div className="space-y-6">
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-['Barlow_Condensed'] text-xl font-bold text-foreground mb-4">Novo Template</h3>
            <div className="mb-4">
              <label className="text-xs font-mono text-muted-foreground block mb-2">NOME DO TEMPLATE</label>
              <input 
                type="text" 
                value={newTemplateName} 
                onChange={(e) => setNewTemplateName(e.target.value)} 
                placeholder="Ex: Fundo Escuro Premium"
                autoFocus
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPrompt(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
              <button onClick={handleCreate} disabled={!newTemplateName.trim()} className="px-4 py-2 text-sm bg-amber-500 text-black font-semibold rounded-md hover:bg-amber-400 disabled:opacity-50">Criar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">Templates de Certificado</h2>
          <p className="text-muted-foreground text-sm">Crie e edite os modelos visuais dos certificados gerados para os alunos.</p>
        </div>
        <button onClick={() => setShowPrompt(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold text-sm rounded-md hover:bg-amber-400 transition-colors">
          + Criar Novo Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-xl shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.backgroundImageUrl ? 'Fundo configurado' : 'Sem imagem de fundo'}
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => deleteTemplate(t.id)}
                className="px-3 py-1.5 text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded transition-colors"
              >
                Excluir
              </button>
              <button
                onClick={() => setEditingTemplateId(t.id)}
                className="px-3 py-1.5 text-xs bg-amber-500/10 text-amber-500 rounded hover:bg-amber-500/20 transition-colors"
              >
                Editar Layout
              </button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card border border-border border-dashed rounded-xl">
            Nenhum template criado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
