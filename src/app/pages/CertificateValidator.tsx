// ─── Certificate Validator ────────────────────────────────────────────────────

import { useState } from "react";
import { QrCode, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

import { apiFetch } from "../lib/api";

export function CertificateValidator() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [certData, setCertData] = useState<any>(null);

  const validate = async () => {
    if (!input.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(`http://localhost:3333/validar/${input}`);
      if (!res.ok && res.status !== 404) throw new Error();
      const data = await res.json();

      if (data.valid) {
         setCertData(data);
         setStatus("valid");
      } else {
         setStatus("invalid");
      }
    } catch (err) {
      setStatus("invalid");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <QrCode size={28} className="text-emerald-400" />
          </div>
          <h1 className="font-['Barlow_Condensed'] text-4xl font-bold text-foreground mb-2">
            Verificar Certificado
          </h1>
          <p className="text-muted-foreground text-sm">
            Insira o Código do certificado ou acesse via QR Code
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-4">
          <label className="text-xs font-mono text-muted-foreground block mb-2">
            CÓDIGO DE VALIDAÇÃO
          </label>
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => { setInput(e.target.value.toUpperCase()); setStatus("idle"); }}
              placeholder="CERT-..."
              className="flex-1 bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
              onKeyDown={(e) => e.key === "Enter" && validate()}
            />
            <button
              onClick={validate}
              disabled={status === "loading" || !input.trim()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#090D18] text-sm font-semibold rounded-md transition-colors"
            >
              {status === "loading" ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                "Verificar"
              )}
            </button>
          </div>
        </div>

        {status === "valid" && certData && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 size={28} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold text-emerald-400 mb-2">
                  Certificado Válido
                </h3>
                <div className="space-y-1.5 text-sm text-slate-300">
                  <p>
                    <span className="text-muted-foreground font-mono text-xs block">ALUNO</span>
                    {certData.issuedTo}
                  </p>
                  {certData.document && (
                    <p>
                      <span className="text-muted-foreground font-mono text-xs block">DOCUMENTO</span>
                      {certData.document}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground font-mono text-xs block">CURSO</span>
                    {certData.course}
                  </p>
                  <p>
                    <span className="text-muted-foreground font-mono text-xs block">CARGA HORÁRIA</span>
                    {certData.duration || 'Não informada'}
                  </p>
                  <p>
                    <span className="text-muted-foreground font-mono text-xs block">EMISSÃO</span>
                    {new Date(certData.issuedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "invalid" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-start gap-4">
            <AlertTriangle size={24} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-['Barlow_Condensed'] text-2xl font-bold text-red-400 mb-1">
                Não encontrado
              </h3>
              <p className="text-sm text-slate-400">
                O ID informado não corresponde a nenhum certificado. Verifique se digitou corretamente.
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Verificação pública e gratuita ·{" "}
          <span className="text-amber-400">SafeTrain</span>
        </p>
      </div>
    </div>
  );
}
