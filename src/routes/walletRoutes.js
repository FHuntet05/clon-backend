const express = require('express')
const router = express.Router()
const {
  generateWallet,
  getUserWallets,
  getWalletBalance
} = require('../controllers/walletController')

// Generate new wallet
router.post('/generate', generateWallet)

// Get user wallets
router.get('/:telegramId', getUserWallets)

// Get wallet balance
router.get('/:telegramId/:network/balance', getWalletBalance)

module.exports = router
