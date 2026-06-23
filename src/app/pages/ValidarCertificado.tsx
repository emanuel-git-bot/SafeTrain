import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, BookOpen, Clock, Calendar, Search } from 'lucide-react';
import { publicApiFetch } from '../../lib/api';

// For this specific public unauthenticated endpoint, we might want a direct fetch
// as apiFetch injects the auth token, which might be missing or expired.
// But we can just use native fetch to be safe.
const fetchValidation = async (code: string) => {
  const res = await fetch(`http://localhost:3333/validar/${code}`);
  if (!res.ok && res.status !== 404) throw new Error('Falha na conexão');
  return res.json();
};

export function ValidarCertificado() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // If a code is passed in URL hash (e.g., #/validar/ABC-123)
  useEffect(() => {
    const hashCode = window.location.hash.split('/validar/')[1];
    if (hashCode) {
      setCode(hashCode);
      validate(hashCode);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    validate(code.trim());
  };

  const validate = async (searchCode: string) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchValidation(searchCode);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ valid: false, error: 'Ocorreu um erro ao validar o certificado.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D18] flex flex-col items-center justify-center p-6 text-foreground font-sans">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400 rounded-2xl shadow-lg shadow-amber-400/20 mb-6">
            <ShieldCheck size={32} className="text-[#090D18]" />
          </div>
          <h1 className="font-['Barlow_Condensed'] text-4xl font-bold text-white mb-3">
            Validação de Certificado
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Digite o código único presente no certificado para verificar sua autenticidade no sistema SafeTrain.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={20} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: CERT-17234..."
            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-32 text-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="absolute inset-y-2 right-2 px-6 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-400 text-[#090D18] font-bold rounded-lg transition-colors"
          >
            {loading ? 'Buscando...' : 'Validar'}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.valid ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-emerald-500/10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400">Certificado Válido</h3>
                    <p className="text-emerald-400/70 text-sm">Este documento é autêntico e reconhecido.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-emerald-400/50 block mb-1">ALUNO CERTIFICADO</label>
                    <p className="text-white font-medium text-lg">{result.issuedTo}</p>
                    <p className="text-muted-foreground text-sm">{result.document}</p>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-mono text-emerald-400/50 block mb-2">DETALHES DO CURSO</label>
                    <div className="bg-black/20 rounded-xl p-4 space-y-3">
                      <div className="flex gap-3 text-sm text-white">
                        <BookOpen size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{result.course}</span>
                      </div>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <Clock size={16} className="text-emerald-400/70 shrink-0" />
                        <span>Carga Horária: {result.duration || 'Não informada'}</span>
                      </div>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <Calendar size={16} className="text-emerald-400/70 shrink-0" />
                        <span>Emitido em: {new Date(result.issuedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 md:p-8 text-center backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Certificado Inválido</h3>
                <p className="text-red-400/80 text-sm max-w-xs mx-auto">
                  {result.error || 'O código informado não foi encontrado em nossa base de dados. Verifique se foi digitado corretamente.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
