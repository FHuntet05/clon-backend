# Deployment Guide - COSNO Backend en Render

## 📋 Pre-requisitos

1. **MongoDB Atlas Account**: Crear cluster gratuito en [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Render Account**: Crear cuenta en [Render](https://render.com/)
3. **Telegram Bot**: Crear bot con [@BotFather](https://t.me/botfather)

## 🗄️ Configurar MongoDB Atlas

1. Crear cluster gratuito (M0)
2. Crear database user con password
3. Configurar Network Access (0.0.0.0/0 para development)
4. Obtener connection string: `mongodb+srv://username:password@cluster.mongodb.net/cosno-clone`

## 🚀 Deploy en Render

### 1. Conectar Repositorio
- Fork este repositorio o usar tu propio repo
- Conectar GitHub account en Render
- Crear nuevo Web Service

### 2. Configuración del Service
```yaml
Build Command: npm install
Start Command: npm start
Environment: Node
Plan: Starter (gratis)
```

### 3. Variables de Entorno

Configurar estas variables en Render Dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cosno-clone
JWT_SECRET=tu_jwt_secret_super_seguro_aquí
BOT_TOKEN=tu_telegram_bot_token
WEBHOOK_URL=https://tu-app-name.onrender.com
TRON_API_KEY=tu_tron_api_key_opcional
BSC_RPC_URL=https://bsc-dataseed.binance.org/
TRON_NETWORK=mainnet
BSC_NETWORK=mainnet
APP_ENV=production
CORS_ORIGIN=https://tu-frontend-domain.netlify.app
```

### 4. Telegram Bot Setup
```bash
# Configurar webhook del bot (después del deploy)
curl -X POST https://api.telegram.org/bot<BOT_TOKEN>/setWebhook \
  -d "url=https://tu-backend.onrender.com/api/telegram/webhook"
```

## 🌐 Frontend Deployment

El frontend se puede deployar en:
- **Netlify** (recomendado para sitios estáticos)
- **Vercel**
- **Render** (como sitio estático)

### Variables del Frontend
```env
VITE_API_URL=https://tu-backend.onrender.com/api
VITE_APP_NAME=COSNO
VITE_BOT_USERNAME=tu_bot_username
```

## 🔗 Configurar Dominios

1. **Backend**: `https://cosno-backend.onrender.com`
2. **Frontend**: `https://cosno-app.netlify.app`
3. **Bot**: `https://t.me/tu_bot_username`

## ⚡ Testing

1. Verificar health check: `https://tu-backend.onrender.com/health`
2. Test API endpoints: `https://tu-backend.onrender.com/api/users`
3. Verificar conexión MongoDB en logs de Render

## 🛠️ Troubleshooting

### Backend no responde
- Verificar logs en Render Dashboard
- Confirmar variables de entorno
- Verificar MongoDB connection string

### CORS Errors
- Verificar `CORS_ORIGIN` apunta al frontend correcto
- Incluir protocol (https://) en CORS_ORIGIN

### MongoDB Connection
- Verificar user/password en Atlas
- Confirmar Network Access permite conexiones
- Verificar format del connection string

## 📱 Telegram WebApp

Para configurar como Telegram WebApp:
1. Crear bot con @BotFather
2. Usar `/setmenubutton` para agregar botón de webapp
3. URL del webapp: `https://tu-frontend.netlify.app`

## 🔒 Seguridad

- [ ] Cambiar JWT_SECRET a valor seguro
- [ ] Configurar rate limiting
- [ ] Usar HTTPS en producción
- [ ] Configurar MongoDB IP whitelist
- [ ] Rotar API keys regularmente
