import { IPaymentProvider, PaymentRequest, PaymentResponse } from './provider.js';

export class NubankProvider implements IPaymentProvider {
  private clientId: string;
  private clientSecret: string;
  private certificate: string; // mTLS cert if needed in the future

  constructor(credentialsString: string) {
    try {
      // Expecting a JSON string: {"clientId":"...","clientSecret":"...","certificate":"..."}
      const creds = JSON.parse(credentialsString);
      this.clientId = creds.clientId || '';
      this.clientSecret = creds.clientSecret || '';
      this.certificate = creds.certificate || '';
    } catch (e) {
      // Fallback for simple tokens
      this.clientId = credentialsString;
      this.clientSecret = '';
      this.certificate = '';
    }
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    console.log(`Processing ${request.method} payment for Order ${request.orderId} via Nubank...`);
    
    if (request.method !== 'pix') {
      return {
        success: false,
        status: 'failed',
        errorMessage: 'O Nubank Provider atual suporta apenas PIX.'
      };
    }

    try {
      // In a real integration, we would:
      // 1. Obtain an OAuth2 token using this.clientId and this.clientSecret (and mTLS via this.certificate)
      // 2. Call the Nubank /v2/cob/{txid} endpoint to generate the charge
      
      // Since this requires valid credentials and mTLS setup with Cloudflare Workers (which requires specific worker bindings),
      // we establish the expected interface here. For immediate unblocking, we can use a mock response or a third-party Pix generator 
      // if credentials are not yet configured properly.

      if (!this.clientId || this.clientId.includes('mock')) {
        // Mock generation for development / testing without valid credentials
        const txid = `NUBANK${Date.now()}${request.orderId}`;
        const mockPixCopiaECola = `00020101021126580014br.gov.bcb.pix0136${txid}5204000053039865404${request.amount.toFixed(2)}5802BR5913Safetrain Inc6009Sao Paulo62070503***6304ABCD`;
        
        return {
          success: true,
          gatewayId: txid,
          status: 'pending',
          paymentUrl: mockPixCopiaECola,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockPixCopiaECola)}`
        };
      }

      // TODO: Replace with real Nubank API calls once credentials format and mTLS dispatcher is configured in the environment
      // const token = await this.getAccessToken();
      // const res = await fetch(`https://api.nubank.com.br/v2/cob/${request.orderId}`, { ... })
      
      return {
        success: false,
        status: 'failed',
        errorMessage: 'A integração real com a API do Nubank requer configuração de mTLS e tokens válidos.'
      };

    } catch (err: any) {
      console.error("Erro na requisição Nubank:", err);
      return {
        success: false,
        status: 'failed',
        errorMessage: 'Erro ao se comunicar com a API do Nubank'
      };
    }
  }
}
