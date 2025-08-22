#!/usr/bin/env node

/**
 * Script de configuração rápida para a integração Kwify + Firebase + Email
 * Execute com: node setup.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 Configuração da Integração Kwify + Firebase + Email');
  console.log('=' .repeat(60));
  console.log('\nEste script irá ajudá-lo a configurar as variáveis de ambiente.');
  console.log('Pressione Enter para pular campos opcionais.\n');

  const config = {};

  // Firebase Configuration
  console.log('🔥 CONFIGURAÇÃO FIREBASE');
  console.log('-' .repeat(30));
  config.FIREBASE_PROJECT_ID = await question('Project ID do Firebase: ');
  config.FIREBASE_CLIENT_EMAIL = await question('Client Email (firebase-adminsdk-...): ');
  config.FIREBASE_PRIVATE_KEY_ID = await question('Private Key ID: ');
  
  console.log('\n⚠️  Para a Private Key, cole todo o conteúdo incluindo as linhas BEGIN/END:');
  config.FIREBASE_PRIVATE_KEY = await question('Private Key: ');
  
  config.FIREBASE_CLIENT_ID = await question('Client ID: ');
  config.FIREBASE_CLIENT_CERT_URL = await question('Client Cert URL (ou Enter para auto-gerar): ');
  
  if (!config.FIREBASE_CLIENT_CERT_URL) {
    const encodedEmail = encodeURIComponent(config.FIREBASE_CLIENT_EMAIL);
    config.FIREBASE_CLIENT_CERT_URL = `https://www.googleapis.com/robot/v1/metadata/x509/${encodedEmail}`;
  }

  // Email Configuration
  console.log('\n📧 CONFIGURAÇÃO DE EMAIL');
  console.log('-' .repeat(30));
  config.SMTP_HOST = await question('SMTP Host (ex: smtp.gmail.com): ') || 'smtp.gmail.com';
  config.SMTP_PORT = await question('SMTP Port (ex: 587): ') || '587';
  config.SMTP_SECURE = await question('SMTP Secure (true/false): ') || 'false';
  config.SMTP_USER = await question('Email do remetente: ');
  config.SMTP_PASS = await question('Senha do email (ou App Password): ');
  config.FROM_EMAIL = config.SMTP_USER;
  config.FROM_NAME = await question('Nome do remetente: ') || 'Sistema';

  // Kwify Configuration
  console.log('\n🛒 CONFIGURAÇÃO KWIFY');
  console.log('-' .repeat(30));
  config.KWIFY_WEBHOOK_SECRET = await question('Webhook Secret da Kwify (opcional): ');

  // App Configuration
  console.log('\n⚙️  CONFIGURAÇÃO DA APLICAÇÃO');
  console.log('-' .repeat(30));
  config.LOGIN_URL = await question('URL de login da sua aplicação: ');
  config.NODE_ENV = 'production';

  // Generate .env.local file
  console.log('\n📝 Gerando arquivo .env.local...');
  
  let envContent = '# Configuração gerada automaticamente\n';
  envContent += `# Gerado em: ${new Date().toISOString()}\n\n`;
  
  envContent += '# Firebase Configuration\n';
  envContent += `FIREBASE_PROJECT_ID=${config.FIREBASE_PROJECT_ID}\n`;
  envContent += `FIREBASE_PRIVATE_KEY_ID=${config.FIREBASE_PRIVATE_KEY_ID}\n`;
  envContent += `FIREBASE_PRIVATE_KEY="${config.FIREBASE_PRIVATE_KEY}"\n`;
  envContent += `FIREBASE_CLIENT_EMAIL=${config.FIREBASE_CLIENT_EMAIL}\n`;
  envContent += `FIREBASE_CLIENT_ID=${config.FIREBASE_CLIENT_ID}\n`;
  envContent += `FIREBASE_CLIENT_CERT_URL=${config.FIREBASE_CLIENT_CERT_URL}\n\n`;
  
  envContent += '# Email Configuration\n';
  envContent += `SMTP_HOST=${config.SMTP_HOST}\n`;
  envContent += `SMTP_PORT=${config.SMTP_PORT}\n`;
  envContent += `SMTP_SECURE=${config.SMTP_SECURE}\n`;
  envContent += `SMTP_USER=${config.SMTP_USER}\n`;
  envContent += `SMTP_PASS=${config.SMTP_PASS}\n`;
  envContent += `FROM_EMAIL=${config.FROM_EMAIL}\n`;
  envContent += `FROM_NAME=${config.FROM_NAME}\n\n`;
  
  if (config.KWIFY_WEBHOOK_SECRET) {
    envContent += '# Kwify Configuration\n';
    envContent += `KWIFY_WEBHOOK_SECRET=${config.KWIFY_WEBHOOK_SECRET}\n\n`;
  }
  
  envContent += '# Application Configuration\n';
  if (config.LOGIN_URL) {
    envContent += `LOGIN_URL=${config.LOGIN_URL}\n`;
  }
  envContent += `NODE_ENV=${config.NODE_ENV}\n`;

  fs.writeFileSync('.env.local', envContent);
  
  console.log('✅ Arquivo .env.local criado com sucesso!');
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 CONFIGURAÇÃO CONCLUÍDA!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Verifique o arquivo .env.local gerado');
  console.log('   2. Execute: npm run dev (para testar localmente)');
  console.log('   3. Execute: node test/webhook-test.js (para testar a integração)');
  console.log('   4. Execute: vercel --prod (para fazer deploy)');
  console.log('   5. Configure o webhook na Kwify com a URL gerada');
  
  console.log('\n🔗 URLs importantes:');
  console.log('   • Webhook: https://seu-projeto.vercel.app/api/webhook');
  console.log('   • Teste: https://seu-projeto.vercel.app/api/webhook (POST)');
  
  console.log('\n📚 Documentação:');
  console.log('   • README.md - Instruções completas');
  console.log('   • .env.example - Exemplo de variáveis');
  
  rl.close();
}

// Verificar se já existe .env.local
if (fs.existsSync('.env.local')) {
  console.log('⚠️  Arquivo .env.local já existe!');
  rl.question('Deseja sobrescrever? (s/N): ', (answer) => {
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
      setup();
    } else {
      console.log('Configuração cancelada.');
      rl.close();
    }
  });
} else {
  setup();
}
