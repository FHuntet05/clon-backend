const express = require('express')
const router = express.Router()
const {
  getLeaderboard,
  getUserRank,
  getLeaderboardStats
} = require('../controllers/leaderboardController')

// Get leaderboard
router.get('/', getLeaderboard)

// Get user rank
router.get('/rank/:telegramId', getUserRank)

// Get leaderboard stats
router.get('/stats', getLeaderboardStats)

module.exports = router