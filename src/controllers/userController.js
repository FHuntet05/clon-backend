const User = require('../models/User')
const { validateTelegramData } = require('../utils/telegram')

// Get or create user (authentication)
const authenticateUser = async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username, languageCode } = req.body

    // Validate Telegram data (in production, verify initData)
    if (!telegramId || !firstName) {
      return res.status(400).json({ error: 'Missing required user data' })
    }

    let user = await User.findOne({ telegramId: telegramId.toString() })

    if (!user) {
      // Create new user
      user = new User({
        telegramId: telegramId.toString(),
        firstName,
        lastName: lastName || '',
        username: username || '',
        languageCode: languageCode || 'en'
      })
      await user.save()
      console.log(`✅ New user created: ${firstName} (${telegramId})`)
    } else {
      // Update existing user
      user.firstName = firstName
      user.lastName = lastName || user.lastName
      user.username = username || user.username
      user.languageCode = languageCode || user.languageCode
      user.lastLogin = new Date()

      // Update energy based on time passed
      user.updateEnergy()
      await user.save()
    }

    res.json({
      id: user._id,
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      balance: user.balance,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      miningRate: user.miningRate,
      level: user.level,
      experience: user.experience,
      totalEarned: user.totalEarned,
      referralCode: user.referralCode,
      wallet: {
        tron: user.wallets.tron ? { address: user.wallets.tron.address } : null,
        bsc: user.wallets.bsc ? { address: user.wallets.bsc.address } : null
      }
    })
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

// Update user balance (mining)
const updateBalance = async (req, res) => {
  try {
    const { telegramId } = req.params
    const { balance, energy, coinsEarned } = req.body

    const user = await User.findOne({ telegramId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update energy based on time
    user.updateEnergy()

    // Validate energy consumption
    if (user.energy < 1) {
      return res.status(400).json({ error: 'Insufficient energy' })
    }

    // Update user stats
    user.balance = Math.max(0, balance)
    user.energy = Math.max(0, energy)
    user.totalEarned += coinsEarned || 0
    user.experience += coinsEarned || 0

    // Check for level up
    user.calculateLevel()

    await user.save()

    res.json({
      balance: user.balance,
      energy: user.energy,
      totalEarned: user.totalEarned,
      level: user.level,
      maxEnergy: user.maxEnergy,
      miningRate: user.miningRate
    })
  } catch (error) {
    console.error('Balance update error:', error)
    res.status(500).json({ error: 'Failed to update balance' })
  }
}

// Get user referrals
const getReferrals = async (req, res) => {
  try {
    const { telegramId } = req.params

    const user = await User.findOne({ telegramId })
      .populate('referrals', 'firstName lastName username level totalEarned createdAt')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const referralEarnings = user.referrals.reduce((total, referral) => {
      return total + Math.floor(referral.totalEarned * 0.05) // 5% commission
    }, 0)

    res.json({
      referrals: user.referrals.map(ref => ({
        id: ref._id,
        username: ref.username || ref.firstName,
        joinedAt: ref.createdAt,
        earnings: Math.floor(ref.totalEarned * 0.05),
        level: ref.level
      })),
      totalEarnings: referralEarnings,
      referralCode: user.referralCode
    })
  } catch (error) {
    console.error('Get referrals error:', error)
    res.status(500).json({ error: 'Failed to get referrals' })
  }
}

// Add referral
const addReferral = async (req, res) => {
  try {
    const { telegramId, referralCode } = req.body

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code required' })
    }

    const user = await User.findOne({ telegramId })
    const referrer = await User.findOne({ referralCode })

    if (!user || !referrer) {
      return res.status(404).json({ error: 'User or referrer not found' })
    }

    if (user.referredBy) {
      return res.status(400).json({ error: 'User already has a referrer' })
    }

    if (referrer.telegramId === telegramId) {
      return res.status(400).json({ error: 'Cannot refer yourself' })
    }

    // Add referral relationship
    user.referredBy = referrer._id
    referrer.referrals.push(user._id)

    // Bonus coins for both users
    user.balance += 1000
    user.totalEarned += 1000
    referrer.balance += 500
    referrer.totalEarned += 500

    await user.save()
    await referrer.save()

    res.json({
      message: 'Referral added successfully',
      bonus: 1000,
      referrerBonus: 500
    })
  } catch (error) {
    console.error('Add referral error:', error)
    res.status(500).json({ error: 'Failed to add referral' })
  }
}

module.exports = {
  authenticateUser,
  updateBalance,
  getReferrals,
  addReferral
}