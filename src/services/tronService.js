const TronWeb = require('tronweb')
const crypto = require('crypto')

// Initialize TronWeb
const tronWeb = new TronWeb({
  fullHost: process.env.TRON_NETWORK === 'mainnet'
    ? 'https://api.trongrid.io'
    : 'https://api.shasta.trongrid.io',
  headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY || '' }
})

// Generate new TRON wallet
const generateTronWallet = async () => {
  try {
    // Generate random private key
    const privateKey = crypto.randomBytes(32).toString('hex')

    // Create account from private key
    const account = tronWeb.address.fromPrivateKey(privateKey)

    // Validate address
    const isValid = tronWeb.isAddress(account)
    if (!isValid) {
      throw new Error('Invalid TRON address generated')
    }

    return {
      address: account,
      privateKey: privateKey,
      network: 'tron',
      type: 'deposit-only'
    }
  } catch (error) {
    console.error('TRON wallet generation error:', error)
    throw new Error('Failed to generate TRON wallet')
  }
}

// Get TRON balance (for future use)
const getTronBalance = async (address) => {
  try {
    const balance = await tronWeb.trx.getBalance(address)
    return tronWeb.fromSun(balance) // Convert from SUN to TRX
  } catch (error) {
    console.error('TRON balance error:', error)
    return '0'
  }
}

// Validate TRON address
const isValidTronAddress = (address) => {
  return tronWeb.isAddress(address)
}

module.exports = {
  generateTronWallet,
  getTronBalance,
  isValidTronAddress,
  tronWeb
}