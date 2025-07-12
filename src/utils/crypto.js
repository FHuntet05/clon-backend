const crypto = require('crypto')

const algorithm = 'aes-256-gcm'
const secretKey = process.env.JWT_SECRET || 'cosno_encryption_key_2024'
const key = crypto.scryptSync(secretKey, 'salt', 32)

// Encrypt private key
const encryptPrivateKey = (privateKey) => {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(algorithm, key)
    cipher.setAAD(Buffer.from('cosno-wallet', 'utf8'))

    let encrypted = cipher.update(privateKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt private key')
  }
}

// Decrypt private key
const decryptPrivateKey = (encryptedData) => {
  try {
    const { encrypted, iv, authTag } = encryptedData
    const decipher = crypto.createDecipher(algorithm, key)

    decipher.setAAD(Buffer.from('cosno-wallet', 'utf8'))
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt private key')
  }
}

// Generate secure random string
const generateSecureRandom = (length = 32) => {
  return crypto.randomBytes(length).toString('hex')
}

// Hash password/data
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex')
}

module.exports = {
  encryptPrivateKey,
  decryptPrivateKey,
  generateSecureRandom,
  hashData
}