/**
 * Script de teste para validar a integração localmente
 * Execute com: node test/webhook-test.js
 */

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const { createFirebaseUser, generateSecurePassword } = require('../lib/firebase');
const { sendLoginCredentials, verifyEmailConfig } = require('../lib/email');

// Dados de teste simulando uma compra da Kwify
const testPurchaseData = {
  status: 'approved',
  customer: {
    email: 'ericklopes2019@gmail.com',
    name: 'João Silva Teste'
  },
  product: {
    name: 'Produto de Teste'
  },
  amount: '99.90',
  transaction_id: 'test_txn_' + Date.now()
};

// Gerar email único para teste
const uniqueTestEmail = `teste.${Date.now()}@exemplo.com`;
testPurchaseData.customer.email = uniqueTestEmail;

async function testIntegration() {
  console.log('🧪 Iniciando teste da integração...');
  console.log('=' .repeat(50));

  try {
    // 1. Verificar configuração de email (opcional)
    console.log('\n1️⃣ Verificando configuração de email...');
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      console.log('⚠️ Configuração de email não disponível (configure suas credenciais SMTP)');
    } else {
      console.log('✅ Configuração de email OK');
    }

    // 2. Gerar senha
    console.log('\n2️⃣ Gerando senha segura...');
    const password = generateSecurePassword(12);
    console.log('✅ Senha gerada:', password);

    // 3. Criar usuário no Firebase
    console.log('\n3️⃣ Criando usuário no Firebase...');
    const firebaseResult = await createFirebaseUser(
      testPurchaseData.customer.email,
      password,
      testPurchaseData.customer.name
    );

    if (!firebaseResult.success) {
      throw new Error('Falha ao criar usuário no Firebase: ' + firebaseResult.error);
    }
    console.log('✅ Usuário criado no Firebase:', firebaseResult.uid);

    // 4. Enviar email com credenciais
    console.log('\n4️⃣ Enviando email com credenciais...');
    const emailResult = await sendLoginCredentials(
      'ericklopes2019@gmail.com', // Email de destino real
      password,
      testPurchaseData.customer.name,
      testPurchaseData
    );

    if (!emailResult.success) {
      console.warn('⚠️ Falha ao enviar email:', emailResult.error);
    } else {
      console.log('✅ Email enviado com sucesso:', emailResult.messageId);
    }

    // 5. Resultado final
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('\n📋 Resumo:');
    console.log(`   • Firebase UID: ${firebaseResult.uid}`);
    console.log(`   • Email: ${testPurchaseData.customer.email}`);
    console.log(`   • Senha: ${password}`);
    console.log(`   • Email enviado: ${emailResult.success ? 'Sim' : 'Não'}`);
    console.log(`   • Transaction ID: ${testPurchaseData.transaction_id}`);

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Verifique:');
    console.error('   • Variáveis de ambiente estão configuradas?');
    console.error('   • Firebase está configurado corretamente?');
    console.error('   • Configurações SMTP estão corretas?');
    console.error('   • O email de teste não existe no Firebase?');
    process.exit(1);
  }
}

// Função para testar apenas o webhook (sem criar usuário)
async function testWebhookPayload() {
  console.log('\n🔗 Testando payload do webhook...');
  
  const webhookPayload = {
    ...testPurchaseData,
    timestamp: new Date().toISOString(),
    event: 'purchase.approved'
  };
  
  console.log('📦 Payload simulado:');
  console.log(JSON.stringify(webhookPayload, null, 2));
  
  // Simular extração de dados
  const customerInfo = {
    email: webhookPayload.customer?.email || webhookPayload.buyer_email,
    name: webhookPayload.customer?.name || webhookPayload.buyer_name || 'Cliente',
    productName: webhookPayload.product?.name || webhookPayload.product_name,
    amount: webhookPayload.amount || webhookPayload.price,
    transactionId: webhookPayload.transaction_id || webhookPayload.id,
    status: webhookPayload.status
  };
  
  console.log('\n📋 Dados extraídos:');
  console.log(JSON.stringify(customerInfo, null, 2));
  
  return customerInfo;
}

// Executar teste baseado no argumento
const testType = process.argv[2] || 'full';

switch (testType) {
  case 'webhook':
    testWebhookPayload();
    break;
  case 'email':
    verifyEmailConfig().then(valid => {
      console.log('Email config valid:', valid);
    });
    break;
  case 'full':
  default:
    testIntegration();
    break;
}

// Instruções de uso
if (process.argv.includes('--help')) {
  console.log('\n📖 Como usar:');
  console.log('   node test/webhook-test.js          # Teste completo');
  console.log('   node test/webhook-test.js webhook  # Teste apenas payload');
  console.log('   node test/webhook-test.js email    # Teste apenas email');
  console.log('   node test/webhook-test.js --help   # Esta ajuda');
}