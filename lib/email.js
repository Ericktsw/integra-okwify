const nodemailer = require('nodemailer');

/**
 * Configura o transportador de email
 */
function createEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Envia email com credenciais de login
 * @param {string} email - Email do destinatário
 * @param {string} password - Senha gerada
 * @param {string} displayName - Nome do usuário
 * @param {Object} purchaseData - Dados da compra da Kwify
 * @returns {Promise<Object>} - Resultado do envio
 */
async function sendLoginCredentials(email, password, displayName, purchaseData) {
  try {
    const transporter = createEmailTransporter();
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Suas Credenciais de Acesso</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .credentials { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo(a), ${displayName}!</h1>
          </div>
          <div class="content">
            <h2>Sua compra foi processada com sucesso!</h2>
            <p>Obrigado por sua compra! Suas credenciais de acesso foram criadas automaticamente.</p>
            
            <div class="credentials">
              <h3>🔐 Suas Credenciais de Acesso:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Senha:</strong> ${password}</p>
            </div>
            
            <p><strong>⚠️ Importante:</strong></p>
            <ul>
              <li>Guarde essas credenciais em local seguro</li>
              <li>Recomendamos alterar sua senha no primeiro acesso</li>
              <li>Nunca compartilhe suas credenciais com terceiros</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.LOGIN_URL || '#'}" class="button">Fazer Login Agora</a>
            </div>
            
            <h3>📋 Detalhes da Compra:</h3>
            <p><strong>Produto:</strong> ${purchaseData.product_name || 'N/A'}</p>
            <p><strong>Valor:</strong> R$ ${purchaseData.amount || 'N/A'}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="footer">
            <p>Se você não fez esta compra, entre em contato conosco imediatamente.</p>
            <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Sistema'}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: '🔐 Suas Credenciais de Acesso - Compra Confirmada',
      html: htmlTemplate,
      text: `
        Olá ${displayName}!
        
        Sua compra foi processada com sucesso!
        
        Suas credenciais de acesso:
        Email: ${email}
        Senha: ${password}
        
        Guarde essas informações em local seguro.
        
        Detalhes da compra:
        Produto: ${purchaseData.product_name || 'N/A'}
        Valor: R$ ${purchaseData.amount || 'N/A'}
        Data: ${new Date().toLocaleDateString('pt-BR')}
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado com sucesso:', result.messageId);
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verifica a configuração do email
 * @returns {Promise<boolean>} - True se a configuração está válida
 */
async function verifyEmailConfig() {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log('Configuração de email verificada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro na configuração de email:', error);
    return false;
  }
}

module.exports = {
  sendLoginCredentials,
  verifyEmailConfig
};