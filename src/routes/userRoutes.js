const express = require('express')
const router = express.Router()
const {
  authenticateUser,
  updateBalance,
  getReferrals,
  addReferral
} = require('../controllers/userController')

// Authentication route
router.post('/auth', authenticateUser)

// Update balance (mining)
router.put('/:telegramId/balance', updateBalance)

// Get user referrals
router.get('/:telegramId/referrals', getReferrals)

// Add referral
router.post('/referral', addReferral)

module.exports = router