const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: ''
  },
  languageCode: {
    type: String,
    default: 'en'
  },
  balance: {
    type: Number,
    default: 1000,
    min: 0
  },
  energy: {
    type: Number,
    default: 100,
    min: 0,
    max: 1000
  },
  maxEnergy: {
    type: Number,
    default: 100,
    min: 100
  },
  miningRate: {
    type: Number,
    default: 1,
    min: 1
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 1000,
    min: 0
  },
  referralCode: {
    type: String,
    unique: true,
    index: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  wallets: {
    tron: {
      address: String,
      privateKey: String, // Encrypted
      createdAt: Date
    },
    bsc: {
      address: String,
      privateKey: String, // Encrypted
      createdAt: Date
    }
  },
  upgrades: [{
    upgradeId: String,
    level: { type: Number, default: 1 },
    purchasedAt: Date
  }],
  lastEnergyUpdate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = `REF${this.telegramId}`
  }
  next()
})

// Update energy based on time passed
userSchema.methods.updateEnergy = function() {
  const now = new Date()
  const timeDiff = now - this.lastEnergyUpdate
  const energyToAdd = Math.floor(timeDiff / 3000) // 1 energy per 3 seconds

  if (energyToAdd > 0) {
    this.energy = Math.min(this.maxEnergy, this.energy + energyToAdd)
    this.lastEnergyUpdate = now
  }

  return this.energy
}

// Calculate level from experience
userSchema.methods.calculateLevel = function() {
  const newLevel = Math.floor(this.experience / 1000) + 1
  if (newLevel > this.level) {
    this.level = newLevel
    this.maxEnergy += 10 * (newLevel - this.level)
    this.miningRate += 0.5 * (newLevel - this.level)
  }
  return this.level
}

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim()
})

// Index for leaderboard queries
userSchema.index({ totalEarned: -1 })
userSchema.index({ level: -1 })

module.exports = mongoose.model('User', userSchema)
