import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { apiFetch } from "../../lib/api";

const CONFIG_SECTIONS = [
  {
    title: "Plataforma",
    fields: [
      { label: "NOME DA PLATAFORMA", value: "SafeTrain", mono: false },
      { label: "URL BASE", value: "https://safetrain.com.br", mono: true },
      { label: "E-MAIL DE SUPORTE", value: "suporte@safetrain.com.br", mono: true },
    ],
  },
  {
    title: "Certificados",
    fields: [
      { label: "NOME DO EMISSOR PADRÃO", value: "Dr. Rafael Souza", mono: false },
      { label: "CARGO DO EMISSOR", value: "Coordenador Pedagógico", mono: false },
    ],
  },
];

export function AdminSettings() {
  const [activeGateway, setActiveGateway] = useState('pagbank');
  const [gatewayToken, setGatewayToken] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiFetch('/admin/settings');
      if (response) {
        setActiveGateway(response.activeGateway || 'pagbank');
        setHasToken(response.hasToken);
        setGoogleClientId(response.googleClientId || '');
        setGoogleClientSecret(response.googleClientSecret || '');
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ activeGateway, gatewayToken, googleClientId, googleClientSecret })
      });
      setMessage('Configurações de pagamento salvas com sucesso!');
      setGatewayToken('');
      fetchSettings();
    } catch (err) {
      console.error(err);
      setMessage('Erro ao salvar configurações de pagamento.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-1">
          Configurações
        </h2>
        <p className="text-muted-foreground text-sm">Configurações gerais da plataforma</p>
      </div>

      {CONFIG_SECTIONS.map((section) => (
        <div key={section.title} className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-5">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map((f) => (
              <div key={f.label}>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                  {f.label}
                </label>
                <input
                  defaultValue={f.value}
                  className={cn(
                    "w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50",
                    f.mono && "font-mono"
                  )}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-5 pt-5 border-t border-border">
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors">
              Salvar
            </button>
          </div>
        </div>
      ))}

      {/* Payments */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-foreground mb-5">Pagamentos</h3>
        
        {message && (
          <div className={cn("p-3 rounded-md mb-4 text-sm font-medium", message.includes('Erro') ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400")}>
            {message}
          </div>
        )}

        <form onSubmit={handleSavePayment}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">GATEWAY DE PAGAMENTO</label>
              <select 
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/50"
                value={activeGateway}
                onChange={(e) => setActiveGateway(e.target.value)}
              >
                <option value="mercadopago">Mercado Pago (PIX)</option>
                <option value="pagbank">PagBank (PIX / Cartão)</option>
                <option value="neon">Neon Bank (Em Breve)</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">ACCESS TOKEN DO GATEWAY</label>
              <input
                type="password"
                placeholder={hasToken ? "******** (Token já configurado)" : "Insira o Access Token (ex: APP_USR-...)"}
                value={gatewayToken}
                onChange={(e) => setGatewayToken(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Deixe em branco para manter o token atual. O token é armazenado de forma criptografada no banco de dados.
              </p>
            </div>
            
            <h3 className="text-sm font-medium text-foreground pt-4 border-t border-border">Login Social</h3>
            
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">GOOGLE CLIENT ID</label>
              <input
                type="text"
                placeholder="Ex: 123456789-abc...apps.googleusercontent.com"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
            
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">GOOGLE CLIENT SECRET</label>
              <input
                type="password"
                placeholder="Opcional. Dependendo do fluxo, apenas o Client ID é necessário"
                value={googleClientSecret}
                onChange={(e) => setGoogleClientSecret(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

          </div>
          <div className="flex justify-end mt-5 pt-5 border-t border-border">
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Salvar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
