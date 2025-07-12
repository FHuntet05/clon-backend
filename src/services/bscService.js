const Web3 = require('web3')
const crypto = require('crypto')

// Initialize Web3 with BSC RPC
const web3 = new Web3(
  process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
)

// Generate new BSC wallet
const generateBSCWallet = async () => {
  try {
    // Generate random private key
    const privateKey = '0x' + crypto.randomBytes(32).toString('hex')

    // Create account from private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey)

    // Validate address
    const isValid = web3.utils.isAddress(account.address)
    if (!isValid) {
      throw new Error('Invalid BSC address generated')
    }

    return {
      address: account.address,
      privateKey: privateKey,
      network: 'bsc',
      type: 'deposit-only'
    }
  } catch (error) {
    console.error('BSC wallet generation error:', error)
    throw new Error('Failed to generate BSC wallet')
  }
}

// Get BSC balance (for future use)
const getBSCBalance = async (address) => {
  try {
    const balanceWei = await web3.eth.getBalance(address)
    return web3.utils.fromWei(balanceWei, 'ether') // Convert from Wei to BNB
  } catch (error) {
    console.error('BSC balance error:', error)
    return '0'
  }
}

// Validate BSC address
const isValidBSCAddress = (address) => {
  return web3.utils.isAddress(address)
}

// Get transaction count (nonce)
const getTransactionCount = async (address) => {
  try {
    return await web3.eth.getTransactionCount(address)
  } catch (error) {
    console.error('Get transaction count error:', error)
    return 0
  }
}

module.exports = {
  generateBSCWallet,
  getBSCBalance,
  isValidBSCAddress,
  getTransactionCount,
  web3
}