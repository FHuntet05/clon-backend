const User = require('../models/User')
const { generateTronWallet } = require('../services/tronService')
const { generateBSCWallet } = require('../services/bscService')
const { encryptPrivateKey } = require('../utils/crypto')

// Generate wallet for user
const generateWallet = async (req, res) => {
  try {
    const { telegramId, network } = req.body

    if (!telegramId || !network) {
      return res.status(400).json({ error: 'TelegramId and network are required' })
    }

    if (!['tron', 'bsc'].includes(network)) {
      return res.status(400).json({ error: 'Invalid network. Use "tron" or "bsc"' })
    }

    const user = await User.findOne({ telegramId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if wallet already exists
    if (user.wallets[network]?.address) {
      return res.status(400).json({
        error: `${network.toUpperCase()} wallet already exists`,
        address: user.wallets[network].address
      })
    }

    let walletData
    try {
      if (network === 'tron') {
        walletData = await generateTronWallet()
      } else if (network === 'bsc') {
        walletData = await generateBSCWallet()
      }
    } catch (error) {
      console.error(`${network} wallet generation error:`, error)
      return res.status(500).json({ error: `Failed to generate ${network} wallet` })
    }

    // Encrypt private key before storing
    const encryptedPrivateKey = encryptPrivateKey(walletData.privateKey)

    // Update user with new wallet
    user.wallets[network] = {
      address: walletData.address,
      privateKey: encryptedPrivateKey,
      createdAt: new Date()
    }

    await user.save()

    console.log(`✅ Generated ${network} wallet for user ${user.firstName}: ${walletData.address}`)

    res.json({
      address: walletData.address,
      network: network,
      type: 'deposit-only',
      createdAt: user.wallets[network].createdAt
    })
  } catch (error) {
    console.error('Wallet generation error:', error)
    res.status(500).json({ error: 'Failed to generate wallet' })
  }
}

// Get user wallets
const getUserWallets = async (req, res) => {
  try {
    const { telegramId } = req.params

    const user = await User.findOne({ telegramId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const wallets = {}

    if (user.wallets.tron?.address) {
      wallets.tron = {
        address: user.wallets.tron.address,
        createdAt: user.wallets.tron.createdAt
      }
    }

    if (user.wallets.bsc?.address) {
      wallets.bsc = {
        address: user.wallets.bsc.address,
        createdAt: user.wallets.bsc.createdAt
      }
    }

    res.json(wallets)
  } catch (error) {
    console.error('Get wallets error:', error)
    res.status(500).json({ error: 'Failed to get wallets' })
  }
}

// Get wallet balance (for display purposes)
const getWalletBalance = async (req, res) => {
  try {
    const { telegramId, network } = req.params

    const user = await User.findOne({ telegramId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const wallet = user.wallets[network]
    if (!wallet?.address) {
      return res.status(404).json({ error: `${network} wallet not found` })
    }

    // In a real implementation, you would query the blockchain
    // For now, return mock balance
    res.json({
      address: wallet.address,
      network: network,
      balance: '0.00000000',
      symbol: network === 'tron' ? 'TRX' : 'BNB'
    })
  } catch (error) {
    console.error('Get wallet balance error:', error)
    res.status(500).json({ error: 'Failed to get wallet balance' })
  }
}

module.exports = {
  generateWallet,
  getUserWallets,
  getWalletBalance
}