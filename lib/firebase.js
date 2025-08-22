const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  // Usar o arquivo de service account diretamente
  const serviceAccountPath = path.join(process.cwd(), 'mapperpro-7c39d-firebase-adminsdk-fbsvc-16efa11a73.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
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