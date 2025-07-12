const crypto = require('crypto')

// Validate Telegram WebApp init data
const validateTelegramData = (initData, botToken) => {
  if (!initData || !botToken) {
    return false
  }

  try {
    // Parse the init data
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    urlParams.delete('hash')

    // Create data check string
    const dataCheckArr = []
    for (const [key, value] of urlParams.entries()) {
      dataCheckArr.push(`${key}=${value}`)
    }
    dataCheckArr.sort()
    const dataCheckString = dataCheckArr.join('\n')

    // Create secret key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()

    // Calculate expected hash
    const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    return hash === expectedHash
  } catch (error) {
    console.error('Telegram data validation error:', error)
    return false
  }
}

// Parse Telegram user data from init data
const parseTelegramUser = (initData) => {
  try {
    const urlParams = new URLSearchParams(initData)
    const userString = urlParams.get('user')

    if (!userString) {
      return null
    }

    return JSON.parse(userString)
  } catch (error) {
    console.error('Parse Telegram user error:', error)
    return null
  }
}

// Generate referral link
const generateReferralLink = (botUsername, referralCode) => {
  return `https://t.me/${botUsername}?start=${referralCode}`
}

// Validate Telegram ID format
const isValidTelegramId = (telegramId) => {
  return /^\d+$/.test(telegramId.toString()) && telegramId.toString().length >= 5
}

module.exports = {
  validateTelegramData,
  parseTelegramUser,
  generateReferralLink,
  isValidTelegramId
}