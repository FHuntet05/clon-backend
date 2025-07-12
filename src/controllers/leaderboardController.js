const User = require('../models/User')

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query

    let dateFilter = {}

    // Set date filter based on period
    if (period === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = { lastLogin: { $gte: weekAgo } }
    } else if (period === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter = { lastLogin: { $gte: monthAgo } }
    }

    // Get top users
    const users = await User.find({
      isActive: true,
      ...dateFilter
    })
    .sort({ totalEarned: -1, level: -1, balance: -1 })
    .limit(parseInt(limit))
    .select('firstName lastName username totalEarned balance level createdAt')

    // Format leaderboard data
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      username: user.username || user.firstName,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance,
      totalEarned: user.totalEarned,
      level: user.level,
      avatar: generateAvatar(user.firstName),
      joinedAt: user.createdAt
    }))

    // If no users found, return mock data for development
    if (leaderboard.length === 0) {
      const mockLeaderboard = [
        {
          rank: 1,
          username: 'CryptoKing',
          balance: 50000,
          totalEarned: 75000,
          level: 15,
          avatar: '👑',
          joinedAt: new Date()
        },
        {
          rank: 2,
          username: 'MinerPro',
          balance: 45000,
          totalEarned: 65000,
          level: 12,
          avatar: '⛏️',
          joinedAt: new Date()
        },
        {
          rank: 3,
          username: 'CoinMaster',
          balance: 40000,
          totalEarned: 60000,
          level: 10,
          avatar: '💰',
          joinedAt: new Date()
        },
        {
          rank: 4,
          username: 'TokenHunter',
          balance: 35000,
          totalEarned: 55000,
          level: 9,
          avatar: '🎯',
          joinedAt: new Date()
        },
        {
          rank: 5,
          username: 'BlockchainBoss',
          balance: 30000,
          totalEarned: 50000,
          level: 8,
          avatar: '🚀',
          joinedAt: new Date()
        }
      ]

      return res.json(mockLeaderboard)
    }

    res.json(leaderboard)
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({ error: 'Failed to get leaderboard' })
  }
}

// Get user rank
const getUserRank = async (req, res) => {
  try {
    const { telegramId } = req.params

    const user = await User.findOne({ telegramId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Count users with higher total earned
    const higherRankedCount = await User.countDocuments({
      isActive: true,
      $or: [
        { totalEarned: { $gt: user.totalEarned } },
        {
          totalEarned: user.totalEarned,
          level: { $gt: user.level }
        },
        {
          totalEarned: user.totalEarned,
          level: user.level,
          balance: { $gt: user.balance }
        }
      ]
    })

    const rank = higherRankedCount + 1

    res.json({
      rank,
      totalEarned: user.totalEarned,
      balance: user.balance,
      level: user.level,
      username: user.username || user.firstName
    })
  } catch (error) {
    console.error('Get user rank error:', error)
    res.status(500).json({ error: 'Failed to get user rank' })
  }
}

// Get leaderboard stats
const getLeaderboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true })
    const totalCoins = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalEarned' } } }
    ])

    const topUser = await User.findOne({ isActive: true })
      .sort({ totalEarned: -1 })
      .select('firstName username totalEarned level')

    res.json({
      totalUsers,
      totalCoinsEarned: totalCoins[0]?.total || 0,
      topUser: topUser ? {
        username: topUser.username || topUser.firstName,
        totalEarned: topUser.totalEarned,
        level: topUser.level
      } : null
    })
  } catch (error) {
    console.error('Get leaderboard stats error:', error)
    res.status(500).json({ error: 'Failed to get leaderboard stats' })
  }
}

// Helper function to generate avatar emoji based on name
const generateAvatar = (name) => {
  const avatars = ['🚀', '⭐', '💎', '🔥', '⚡', '🎯', '🏆', '💰', '🎪', '🌟']
  const index = name ? name.charCodeAt(0) % avatars.length : 0
  return avatars[index]
}

module.exports = {
  getLeaderboard,
  getUserRank,
  getLeaderboardStats
}
