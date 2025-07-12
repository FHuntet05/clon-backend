const User = require('../models/User')
const Upgrade = require('../models/Upgrade')

// Get all available upgrades
const getUpgrades = async (req, res) => {
  try {
    const upgrades = await Upgrade.find({ isActive: true })

    // If no upgrades in database, return default upgrades
    if (upgrades.length === 0) {
      const defaultUpgrades = [
        {
          id: 1,
          name: 'Mining Power',
          description: 'Increase coins per tap',
          type: 'mining_power',
          level: 1,
          cost: 100,
          benefit: '+1 coin per tap',
          icon: 'zap'
        },
        {
          id: 2,
          name: 'Energy Capacity',
          description: 'Increase maximum energy',
          type: 'energy_capacity',
          level: 1,
          cost: 200,
          benefit: '+10 max energy',
          icon: 'battery'
        },
        {
          id: 3,
          name: 'Energy Regeneration',
          description: 'Faster energy recovery',
          type: 'energy_regen',
          level: 1,
          cost: 150,
          benefit: '+1 energy/2s',
          icon: 'clock'
        },
        {
          id: 4,
          name: 'Auto Mining',
          description: 'Mine coins automatically',
          type: 'special',
          level: 1,
          cost: 500,
          benefit: '10 coins/minute',
          icon: 'star'
        }
      ]

      return res.json(defaultUpgrades)
    }

    // Format upgrades for frontend
    const formattedUpgrades = upgrades.map(upgrade => ({
      id: upgrade._id,
      name: upgrade.name,
      description: upgrade.description,
      type: upgrade.type,
      level: 1, // Default level, will be overridden by user's upgrade level
      cost: upgrade.baseCost,
      benefit: `+${upgrade.baseEffect} ${upgrade.type.replace('_', ' ')}`,
      icon: upgrade.icon
    }))

    res.json(formattedUpgrades)
  } catch (error) {
    console.error('Get upgrades error:', error)
    res.status(500).json({ error: 'Failed to get upgrades' })
  }
}

// Purchase upgrade
const purchaseUpgrade = async (req, res) => {
  try {
    const { telegramId, upgradeId } = req.body

    if (!telegramId || !upgradeId) {
      return res.status(400).json({ error: 'TelegramId and upgradeId are required' })
    }

    const user = await User.findOne({ telegramId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Find upgrade in user's upgrades or create new one
    let userUpgrade = user.upgrades.find(u => u.upgradeId === upgradeId.toString())
    const currentLevel = userUpgrade ? userUpgrade.level : 0
    const newLevel = currentLevel + 1

    // Calculate cost for new level
    const baseCost = getUpgradeBaseCost(upgradeId)
    const upgradeCost = Math.floor(baseCost * Math.pow(1.5, currentLevel))

    // Check if user has enough balance
    if (user.balance < upgradeCost) {
      return res.status(400).json({
        error: 'Insufficient balance',
        required: upgradeCost,
        current: user.balance
      })
    }

    // Deduct cost from balance
    user.balance -= upgradeCost

    // Update or add upgrade
    if (userUpgrade) {
      userUpgrade.level = newLevel
      userUpgrade.purchasedAt = new Date()
    } else {
      user.upgrades.push({
        upgradeId: upgradeId.toString(),
        level: newLevel,
        purchasedAt: new Date()
      })
    }

    // Apply upgrade effects
    applyUpgradeEffects(user, upgradeId, newLevel)

    await user.save()

    console.log(`✅ User ${user.firstName} purchased upgrade ${upgradeId} level ${newLevel}`)

    res.json({
      message: 'Upgrade purchased successfully',
      newLevel,
      cost: upgradeCost,
      newBalance: user.balance,
      effects: getUpgradeEffects(upgradeId, newLevel)
    })
  } catch (error) {
    console.error('Purchase upgrade error:', error)
    res.status(500).json({ error: 'Failed to purchase upgrade' })
  }
}

// Get user's upgrades
const getUserUpgrades = async (req, res) => {
  try {
    const { telegramId } = req.params

    const user = await User.findOne({ telegramId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      upgrades: user.upgrades,
      miningRate: user.miningRate,
      maxEnergy: user.maxEnergy
    })
  } catch (error) {
    console.error('Get user upgrades error:', error)
    res.status(500).json({ error: 'Failed to get user upgrades' })
  }
}

// Helper functions
const getUpgradeBaseCost = (upgradeId) => {
  const costs = {
    '1': 100,  // Mining Power
    '2': 200,  // Energy Capacity
    '3': 150,  // Energy Regeneration
    '4': 500   // Auto Mining
  }
  return costs[upgradeId.toString()] || 100
}

const applyUpgradeEffects = (user, upgradeId, level) => {
  switch (upgradeId.toString()) {
    case '1': // Mining Power
      user.miningRate += 1
      break
    case '2': // Energy Capacity
      user.maxEnergy += 10
      break
    case '3': // Energy Regeneration
      // This would affect energy regeneration speed
      // Implemented in the energy update logic
      break
    case '4': // Auto Mining
      // This would enable auto mining
      // Implemented separately
      break
  }
}

const getUpgradeEffects = (upgradeId, level) => {
  const effects = {
    '1': `+${level} coins per tap`,
    '2': `+${level * 10} max energy`,
    '3': `+${level} energy regeneration`,
    '4': `${level * 10} coins per minute auto`
  }
  return effects[upgradeId.toString()] || 'Unknown effect'
}

module.exports = {
  getUpgrades,
  purchaseUpgrade,
  getUserUpgrades
}