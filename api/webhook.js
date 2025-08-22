const { createFirebaseUser, generateSecurePassword } = require('../lib/firebase');
const { sendLoginCredentials } = require('../lib/email');
const crypto = require('crypto');

/**
 * Verifica a assinatura do webhook da Kwify
 * @param {string} payload - Corpo da requisição
 * @param {string} signature - Assinatura do header
 * @param {string} secret - Segredo do webhook
 * @returns {boolean} - True se a assinatura é válida
 */
function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  // Remove o prefixo 'sha256=' se existir
  const cleanSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(cleanSignature, 'hex')
  );
}

/**
 * Extrai informações do cliente a partir dos dados da Kwify
 * @param {Object} kwifyData - Dados recebidos da Kwify
 * @returns {Object} - Informações do cliente
 */
function extractCustomerInfo(kwifyData) {
  // Adapte estes campos conforme a estrutura real da Kwify
  return {
    email: kwifyData.customer?.email || kwifyData.buyer_email,
    name: kwifyData.customer?.name || kwifyData.buyer_name || 'Cliente',
    phone: kwifyData.customer?.phone || kwifyData.buyer_phone,
    productName: kwifyData.product?.name || kwifyData.product_name,
    amount: kwifyData.amount || kwifyData.price,
    transactionId: kwifyData.transaction_id || kwifyData.id,
    status: kwifyData.status
  };
}

/**
 * Função principal do webhook
 */
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Kwify-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('Webhook recebido:', new Date().toISOString());
    console.log('Headers:', req.headers);
    
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-kwify-signature'] || req.headers['x-signature'];
    
    // Verificar assinatura do webhook (se configurada)
    if (process.env.KWIFY_WEBHOOK_SECRET) {
      const isValidSignature = verifyWebhookSignature(
        payload,
        signature,
        process.env.KWIFY_WEBHOOK_SECRET
      );
      
      if (!isValidSignature) {
        console.error('Assinatura do webhook inválida');
        return res.status(401).json({ error: 'Assinatura inválida' });
      }
    }

    const kwifyData = req.body;
    console.log('Dados da Kwify:', kwifyData);

    // Verificar se é uma compra aprovada
    if (kwifyData.status !== 'approved' && kwifyData.status !== 'paid') {
      console.log('Status da transação não é aprovado:', kwifyData.status);
      return res.status(200).json({ 
        message: 'Webhook recebido, mas transação não aprovada',
        status: kwifyData.status
      });
    }

    // Extrair informações do cliente
    const customerInfo = extractCustomerInfo(kwifyData);
    
    if (!customerInfo.email) {
      console.error('Email do cliente não encontrado nos dados da Kwify');
      return res.status(400).json({ error: 'Email do cliente não encontrado' });
    }

    console.log('Informações do cliente extraídas:', customerInfo);

    // Gerar senha segura
    const password = generateSecurePassword(12);
    
    // Criar usuário no Firebase
    console.log('Criando usuário no Firebase...');
    const firebaseResult = await createFirebaseUser(
      customerInfo.email,
      password,
      customerInfo.name
    );

    if (!firebaseResult.success) {
      console.error('Erro ao criar usuário no Firebase:', firebaseResult.error);
      return res.status(500).json({ 
        error: 'Erro ao criar usuário no Firebase',
        details: firebaseResult.error
      });
    }

    console.log('Usuário criado no Firebase com sucesso:', firebaseResult.uid);

    // Enviar email com credenciais
    console.log('Enviando email com credenciais...');
    const emailResult = await sendLoginCredentials(
      customerInfo.email,
      password,
      customerInfo.name,
      {
        product_name: customerInfo.productName,
        amount: customerInfo.amount,
        transaction_id: customerInfo.transactionId
      }
    );

    if (!emailResult.success) {
      console.error('Erro ao enviar email:', emailResult.error);
      // Não retornar erro aqui, pois o usuário já foi criado
      // Apenas logar o erro para investigação
    } else {
      console.log('Email enviado com sucesso:', emailResult.messageId);
    }

    // Resposta de sucesso
    const response = {
      success: true,
      message: 'Usuário criado e email enviado com sucesso',
      data: {
        firebase_uid: firebaseResult.uid,
        email: customerInfo.email,
        email_sent: emailResult.success,
        transaction_id: customerInfo.transactionId
      }
    };

    console.log('Processamento concluído com sucesso:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Erro no processamento do webhook:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}