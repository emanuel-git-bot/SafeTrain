export interface PaymentResponse {
  success: boolean;
  gatewayId?: string;
  paymentUrl?: string; // Para o "Copia e Cola" do PIX ou boleto
  qrCodeUrl?: string; // Para exibir o QrCode em base64/link
  errorMessage?: string;
  status: 'pending' | 'paid' | 'failed';
}

export interface PaymentRequest {
  orderId: number;
  amount: number;
  method: 'pix' | 'credit_card';
  customer: {
    name: string;
    email: string;
    document?: string; // CPF/CNPJ
  };
  cardDetails?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
}

export interface IPaymentProvider {
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
}
