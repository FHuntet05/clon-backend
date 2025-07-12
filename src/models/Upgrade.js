const mongoose = require('mongoose')

const upgradeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mining_power', 'energy_capacity', 'energy_regen', 'special'],
    required: true
  },
  baseCost: {
    type: Number,
    required: true,
    min: 1
  },
  costMultiplier: {
    type: Number,
    default: 1.5,
    min: 1
  },
  baseEffect: {
    type: Number,
    required: true
  },
  effectMultiplier: {
    type: Number,
    default: 1.2,
    min: 1
  },
  maxLevel: {
    type: Number,
    default: 50,
    min: 1
  },
  icon: {
    type: String,
    default: 'upgrade'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Calculate cost for specific level
upgradeSchema.methods.getCostForLevel = function(level) {
  return Math.floor(this.baseCost * Math.pow(this.costMultiplier, level - 1))
}

// Calculate effect for specific level
upgradeSchema.methods.getEffectForLevel = function(level) {
  return this.baseEffect * Math.pow(this.effectMultiplier, level - 1)
}

module.exports = mongoose.model('Upgrade', upgradeSchema)