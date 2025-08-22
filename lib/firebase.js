const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  // Usar variáveis de ambiente para as credenciais
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "16efa11a732160df139c739f34060d19d45d7e35",
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID || "108442378732040102862",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
    universe_domain: "googleapis.com"
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mapperpro-7c39d-default-rtdb.firebaseio.com"
  });
}

/**
 * Cria um novo usuário no Firebase Authentication
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @param {string} displayName - Nome do usuário
 * @returns {Promise<Object>} - Dados do usuário criado
 */
async function createFirebaseUser(email, password, displayName) {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false
    });

    console.log('Usuário criado com sucesso:', userRecord.uid);
    return {
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName
    };
  } catch (error) {
    console.error('Erro ao criar usuário no Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gera uma senha aleatória segura
 * @param {number} length - Comprimento da senha (padrão: 12)
 * @returns {string} - Senha gerada
 */
function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

module.exports = {
  admin,
  createFirebaseUser,
  generateSecurePassword
};