# Integração Kwify + Firebase + Email

Esta integração automatiza o processo de criação de usuários no Firebase Authentication quando uma compra é aprovada na Kwify, enviando as credenciais por email.

## 🚀 Funcionalidades

- ✅ Recebe webhooks da Kwify automaticamente
- ✅ Cria usuários no Firebase Authentication
- ✅ Gera senhas seguras automaticamente
- ✅ Envia credenciais por email com template HTML
- ✅ Verificação de assinatura do webhook
- ✅ Deploy automático na Vercel

## 📋 Pré-requisitos

1. **Conta Firebase** com Authentication habilitado
2. **Conta Kwify** com webhooks configurados
3. **Conta Vercel** para deploy
4. **Servidor SMTP** para envio de emails (Gmail, SendGrid, etc.)

## ⚙️ Configuração

### 1. Firebase Setup

✅ **Já configurado!** O arquivo de service account `mapperpro-7c39d-firebase-adminsdk-fbsvc-16efa11a73.json` já está no projeto.

**Projeto Firebase:** `mapperpro-7c39d`

Se precisar configurar um novo projeto:
1. Acesse o [Console Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative o **Authentication** e configure o provedor de email/senha
4. Vá em **Configurações do Projeto** > **Contas de Serviço**
5. Clique em **Gerar nova chave privada** e baixe o arquivo JSON
6. Substitua o arquivo atual pelo novo arquivo de service account

### 2. Configuração de Email

#### Gmail (Recomendado)
1. Ative a verificação em 2 etapas na sua conta Google
2. Gere uma "Senha de app" específica para esta aplicação
3. Use essa senha na variável `SMTP_PASS`

#### Outros provedores
- **SendGrid**: Use API Key como senha
- **Mailgun**: Configure SMTP com suas credenciais
- **Amazon SES**: Configure SMTP com credenciais IAM

### 3. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

**Variáveis obrigatórias:**

```env
# Firebase - ✅ JÁ CONFIGURADO via arquivo de service account
# Não é necessário configurar variáveis do Firebase

# Email - ⚠️ CONFIGURE SUAS CREDENCIAIS
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
FROM_EMAIL=seu-email@gmail.com
FROM_NAME=Nome da Sua Empresa

# Kwify (opcional, mas recomendado)
KWIFY_WEBHOOK_SECRET=seu-secret-do-webhook

# App
LOGIN_URL=https://sua-app.com/login
```

## 🚀 Deploy na Vercel

### 1. Instalação

```bash
# Instalar dependências
npm install

# Instalar Vercel CLI (se não tiver)
npm install -g vercel
```

### 2. Deploy

```bash
# Login na Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Configurar Variáveis de Ambiente na Vercel

1. Acesse o dashboard da Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione todas as variáveis do arquivo `.env.example`
4. Faça um novo deploy para aplicar as mudanças

## 🔗 Configuração da Kwify

1. Acesse o painel da Kwify
2. Vá em **Configurações** > **Webhooks**
3. Adicione a URL do webhook: `https://seu-projeto.vercel.app/api/webhook`
4. Configure os eventos: `purchase.approved` ou `payment.approved`
5. Adicione o secret do webhook (mesmo valor da variável `KWIFY_WEBHOOK_SECRET`)

## 📧 Template de Email

O email enviado inclui:
- Credenciais de acesso (email e senha)
- Detalhes da compra
- Link para login
- Instruções de segurança
- Design responsivo em HTML

## 🧪 Testando a Integração

### 1. Teste Local

```bash
# Executar em modo desenvolvimento
npm run dev
```

### 2. Teste do Webhook

Use uma ferramenta como Postman ou curl:

```bash
curl -X POST https://seu-projeto.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Kwify-Signature: sha256=sua-assinatura" \
  -d '{
    "status": "approved",
    "customer": {
      "email": "teste@exemplo.com",
      "name": "João Silva"
    },
    "product": {
      "name": "Produto Teste"
    },
    "amount": "99.90",
    "transaction_id": "txn_123456"
  }'
```

## 🔍 Monitoramento e Logs

### Vercel Logs
```bash
vercel logs
```

### Firebase Console
- Verifique usuários criados em **Authentication** > **Users**

### Logs de Email
- Verifique os logs da Vercel para status de envio
- Configure notificações de falha se necessário

## 🛠️ Estrutura do Projeto

```
├── api/
│   └── webhook.js          # Endpoint principal do webhook
├── lib/
│   ├── firebase.js         # Configuração e funções do Firebase
│   └── email.js           # Configuração e envio de emails
├── .env.example           # Exemplo de variáveis de ambiente
├── vercel.json           # Configuração da Vercel
├── package.json          # Dependências e scripts
└── README.md            # Este arquivo
```

## 🔒 Segurança

- ✅ Verificação de assinatura do webhook
- ✅ Validação de dados de entrada
- ✅ Senhas geradas com caracteres especiais
- ✅ Variáveis de ambiente para credenciais
- ✅ HTTPS obrigatório em produção

## 🐛 Troubleshooting

### Erro: "Firebase user creation failed"
- Verifique as credenciais do Firebase
- Confirme que o Authentication está habilitado
- Verifique se o email já existe no Firebase

### Erro: "Email sending failed"
- Verifique as configurações SMTP
- Confirme que a senha de app está correta (Gmail)
- Teste a conectividade SMTP

### Webhook não recebido
- Verifique a URL do webhook na Kwify
- Confirme que o deploy foi bem-sucedido
- Verifique os logs da Vercel

### Assinatura inválida
- Confirme que o secret está correto em ambos os lados
- Verifique se a Kwify está enviando o header correto

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs da Vercel
2. Consulte a documentação da [Kwify](https://kwify.com.br/docs)
3. Consulte a documentação do [Firebase](https://firebase.google.com/docs)

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.