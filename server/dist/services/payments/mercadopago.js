import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';
export class MercadoPagoProvider {
    client;
    constructor(accessToken) {
        // Inicializa o SDK oficial do Mercado Pago (v2)
        // Opcionalmente podemos configurar options { options: { timeout: 5000 } }
        this.client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
    }
    async processPayment(request) {
        console.log(`Processing ${request.method} payment for Order ${request.orderId} via Mercado Pago...`);
        if (request.method !== 'pix' && request.method !== 'credit_card') {
            return {
                success: false,
                status: 'failed',
                errorMessage: 'O Mercado Pago Provider atual suporta apenas PIX ou Cartão de Crédito.'
            };
        }
        try {
            const payment = new Payment(this.client);
            if (request.method === 'credit_card') {
                // Simulação do sucesso para fins do projeto educacional / ambiente Sandbox.
                // Em produção, o token de cartão viria do frontend (via SDK Mercado Pago) e faríamos um `payment.create`
                return {
                    success: true,
                    gatewayId: `MP-CC-MOCK-${Date.now()}`,
                    status: 'paid', // Simula aprovação imediata
                    paymentUrl: ''
                };
            }
            // Gera a cobrança PIX
            const body = {
                transaction_amount: Number(request.amount.toFixed(2)),
                description: `Pedido #${request.orderId}`,
                payment_method_id: 'pix',
                payer: {
                    email: request.customer.email || 'email@teste.com',
                    first_name: request.customer.name || 'Cliente Plataforma',
                    // O Mercado Pago exige identificação se fornecida (CPF/CNPJ). Se não for um documento válido, omitimos ou usamos genérico.
                    // Aqui tentaremos enviar se houver.
                }
            };
            // Adiciona o documento apenas se existir e tiver tamanho de CPF ou CNPJ
            if (request.customer.document) {
                const doc = request.customer.document.replace(/\D/g, '');
                if (doc.length === 11) {
                    body.payer.identification = { type: 'CPF', number: doc };
                }
                else if (doc.length === 14) {
                    body.payer.identification = { type: 'CNPJ', number: doc };
                }
            }
            // IMPORTANTE: Para PIX, é recomendado usar o idempotency key para evitar duplicidades
            const requestOptions = {
                idempotencyKey: randomUUID()
            };
            const response = await payment.create({ body, requestOptions });
            // O PIX Copia e Cola e o QR Code base64 estão dentro de point_of_interaction
            const txData = response.point_of_interaction?.transaction_data;
            if (!txData || !txData.qr_code || !txData.qr_code_base64) {
                throw new Error('Falha ao gerar dados do PIX (QR Code ausente na resposta).');
            }
            return {
                success: true,
                gatewayId: response.id?.toString() || `MP${Date.now()}`,
                status: 'pending',
                paymentUrl: txData.qr_code, // Copia e Cola
                // O MP retorna o base64 diretamente. Para exibir na tag <img>, prefixamos com data:image/png;base64,
                qrCodeUrl: `data:image/jpeg;base64,${txData.qr_code_base64}`
            };
        }
        catch (err) {
            console.error("Erro na requisição Mercado Pago:", err);
            // Se for um erro da API do SDK v2, a estrutura pode estar em err.message ou err.cause
            return {
                success: false,
                status: 'failed',
                errorMessage: 'Erro ao se comunicar com a API do Mercado Pago'
            };
        }
    }
}
