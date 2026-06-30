// ─── Enroll Modal ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { X, CheckCircle2, PlayCircle, Lock, TicketCheck, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { apiFetch } from "../../lib/api";
import { COURSES } from "../../data/mockData";

type Course = (typeof COURSES)[0];

export function EnrollModal({
  course,
  onClose,
  onSuccess,
}: {
  course: any;
  onClose: () => void;
  onSuccess: (enrollmentId: number) => void;
}) {
  const [tab, setTab] = useState<"buy" | "voucher">("buy");
  const [voucher, setVoucher] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "ok" | "error">("idle");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [pixData, setPixData] = useState<{ qrCodeUrl: string, paymentUrl: string } | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const applyVoucher = async () => {
    setLoading(true);
    setVoucherStatus("idle");
    try {
      const res = await apiFetch('/vouchers/activate', {
        method: 'POST',
        body: JSON.stringify({ code: voucher, courseId: course.id })
      });
      if (res.enrollment) {
        setEnrollmentId(res.enrollment.id);
      }
      setVoucherStatus("ok");
      setTimeout(() => setDone(true), 600);
    } catch (err: any) {
      setVoucherStatus("error");
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const payload: any = { courseId: course.id, paymentMethod };
      if (paymentMethod === 'credit_card') {
        payload.cardDetails = { number: cardNumber, expiry: cardExpiry, cvv: cardCvv };
      }

      const response = await apiFetch('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.paymentStatus === 'pending' && response.qrCodeUrl) {
        setPixData({ qrCodeUrl: response.qrCodeUrl, paymentUrl: response.paymentUrl });
      } else {
        setEnrollmentId(response.orderId); // We can just pass the order ID
        setDone(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro no pagamento ou matrícula");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl">
        {done ? (
          <div className="p-8 text-center">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="font-['Barlow_Condensed'] text-3xl font-bold text-foreground mb-2">
              Matrícula confirmada!
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Você agora tem acesso ao curso{" "}
              <span className="text-foreground font-medium">{course.title}</span>
            </p>
            <button
              onClick={() => enrollmentId && onSuccess(enrollmentId)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <PlayCircle size={16} /> Começar agora
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-medium text-foreground">Matricular-se</h2>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[280px]">
                  {course.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex border-b border-border">
              {(["buy", "voucher"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                    tab === t
                      ? "border-amber-400 text-amber-400"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "buy" ? "💳 Comprar" : "🎟️ Usar código"}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === "buy" ? (
                <div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
                    <span className="text-sm text-muted-foreground">Valor do curso</span>
                    <span className="font-['Barlow_Condensed'] text-2xl font-bold text-amber-400">
                      R$ {course.price}
                    </span>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-mono text-muted-foreground block mb-1.5">MÉTODO DE PAGAMENTO</label>
                    <select 
                      className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:border-amber-500/50 outline-none"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="pix">PIX</option>
                      <option value="credit_card">Cartão de Crédito</option>
                    </select>
                  </div>

                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-3 mb-5 animate-fade-in">
                      <div>
                        <label className="text-xs font-mono text-muted-foreground block mb-1.5">NÚMERO DO CARTÃO</label>
                        <input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-mono text-muted-foreground block mb-1.5">VALIDADE</label>
                          <input
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/AA"
                            className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-mono text-muted-foreground block mb-1.5">CVV</label>
                          <input
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full bg-muted border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {errorMsg && <p className="text-red-400 text-sm mb-3">{errorMsg}</p>}

                  {pixData ? (
                    <div className="mt-4 text-center border border-border rounded-lg p-4 bg-muted/20 animate-fade-in">
                      <h4 className="text-foreground font-bold mb-2">Escaneie o QR Code</h4>
                      <img src={pixData.qrCodeUrl} alt="QR Code PIX" className="mx-auto mb-4 w-40 h-40 bg-white rounded p-2" />
                      <p className="text-xs font-mono text-muted-foreground truncate mb-4 bg-card border border-border rounded px-3 py-2">{pixData.paymentUrl}</p>
                      <p className="text-xs text-muted-foreground mt-4">Aguardando pagamento... (Em desenvolvimento: o webhook atualizará o status automaticamente)</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full py-3 mt-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />} 
                      {course.price > 0 ? `Pagar R$ ${course.price}` : 'Matricular-se grátis'}
                    </button>
                  )}
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Pagamento seguro · SSL
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Insira o código fornecido pela sua empresa para ativar o acesso.
                  </p>
                  <div className="mb-4">
                    <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                      CÓDIGO DE ACESSO
                    </label>
                    <input
                      value={voucher}
                      onChange={(e) => {
                        setVoucher(e.target.value.toUpperCase());
                        setVoucherStatus("idle");
                      }}
                      placeholder="VTC-2024-XXXXX"
                      className={cn(
                        "w-full bg-muted border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono transition-colors",
                        voucherStatus === "ok"
                          ? "border-emerald-500/50"
                          : voucherStatus === "error"
                          ? "border-red-500/50"
                          : "border-border focus:border-amber-500/50"
                      )}
                    />
                    {voucherStatus === "error" && (
                      <p className="text-xs text-red-400 mt-1.5">Código inválido ou já utilizado.</p>
                    )}
                    {voucherStatus === "ok" && (
                      <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Código válido!
                      </p>
                    )}
                  </div>
                  <button
                    onClick={applyVoucher}
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#090D18] font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <TicketCheck size={14} />} 
                    Ativar código
                  </button>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Não tem código?{" "}
                    <button
                      className="text-amber-400 hover:text-amber-300"
                      onClick={() => setTab("buy")}
                    >
                      Compre o acesso
                    </button>
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
