// ─── Admin: Settings ─────────────────────────────────────────────────────────

import { cn } from "../../lib/utils";

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
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">GATEWAY</label>
            <select className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none">
              <option>Stripe</option>
              <option>PagSeguro</option>
              <option>Mercado Pago</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1.5">CHAVE PÚBLICA</label>
            <input
              defaultValue="pk_live_••••••••••••••••"
              className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
        <div className="flex justify-end mt-5 pt-5 border-t border-border">
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#090D18] text-sm font-semibold rounded-md transition-colors">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
