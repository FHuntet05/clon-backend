const express = require('express')
const router = express.Router()
const {
  getUpgrades,
  purchaseUpgrade,
  getUserUpgrades
} = require('../controllers/upgradeController')

// Get all upgrades
router.get('/', getUpgrades)

// Purchase upgrade
router.post('/purchase', purchaseUpgrade)

// Get user upgrades
router.get('/:telegramId', getUserUpgrades)

module.exports = router
