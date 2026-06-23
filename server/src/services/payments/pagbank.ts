import { IPaymentProvider, PaymentRequest, PaymentResponse } from './provider.js';

export class PagBankProvider implements IPaymentProvider {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    console.log(`Processing ${request.method} payment for Order ${request.orderId} via PagBank...`);
    
    const valueInCents = Math.round(request.amount * 100);
    const isSandbox = this.apiToken.includes('sandbox') || this.apiToken.length < 40; // heurística simples
    const baseUrl = isSandbox ? 'https://sandbox.api.pagseguro.com' : 'https://api.pagseguro.com';

    if (request.method === 'pix') {
      try {
        const payload = {
          reference_id: request.orderId.toString(),
          customer: {
            name: request.customer.name || 'Cliente Plataforma',
            email: request.customer.email || 'email@teste.com',
            tax_id: request.customer.document ? request.customer.document.replace(/\D/g, '') : '00000000000'
          },
          items: [
            {
              name: `Pedido #${request.orderId}`,
              quantity: 1,
              unit_amount: valueInCents
            }
          ],
          qr_codes: [
            {
              amount: {
                value: valueInCents
              }
            }
          ]
        };

        const res = await fetch(`${baseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("PagBank API Error:", JSON.stringify(data, null, 2));
          return {
            success: false,
            status: 'failed',
            errorMessage: data.error_messages?.[0]?.description || 'Erro na integração com PagBank'
          };
        }

        const qrCodeData = data.qr_codes?.[0];
        const qrCodeUrl = qrCodeData?.links?.find((l: any) => l.rel === 'QRCODE')?.href;

        return {
          success: true,
          gatewayId: data.id,
          status: 'pending',
          paymentUrl: qrCodeData?.text || '',
          qrCodeUrl: qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeData?.text}`
        };
      } catch (err: any) {
        console.error("Erro na requisição PagBank:", err);
        return {
          success: false,
          status: 'failed',
          errorMessage: 'Erro ao se comunicar com a API do PagBank'
        };
      }
    } else if (request.method === 'credit_card') {
      // Simula uma aprovação imediata
      return {
        success: true,
        gatewayId: `PAGBANK-CARD-${Date.now()}`,
        status: 'paid'
      };
    }

    return {
      success: false,
      status: 'failed',
      errorMessage: 'Método de pagamento não suportado'
    };
  }
}
