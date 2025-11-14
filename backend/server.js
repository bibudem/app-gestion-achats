require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

console.log('🚀 Démarrage du serveur...');

// Import avec gestion d'erreur
let itemsRoutes;
let validationMiddleware;

try {
  itemsRoutes = require('./routes/items');
  console.log('✅ Routes items chargées');
} catch (error) {
  console.error('❌ Erreur chargement routes:', error.message);
  process.exit(1);
}

try {
  validationMiddleware = require('./middleware/validation.middleware');
  console.log('✅ Middleware de validation chargé');
} catch (error) {
  console.error('❌ Erreur chargement middleware:', error.message);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 9111;

/* ---------------------- MIDDLEWARES ----------------------- */
app.use(bodyParser.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Trust proxy
app.set('trust proxy', '10.139.33.12');

// Rate limiting (si disponible)
if (validationMiddleware && validationMiddleware.apiLimiter) {
  app.use('/api', validationMiddleware.apiLimiter);
  console.log('✅ Rate limiting activé');
}

/* ---------------------- ROUTES ----------------------- */
if (itemsRoutes) {
  app.use('/api/items', itemsRoutes);
  console.log('✅ Routes /api/items configurées');
}

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur en fonctionnement',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs (si disponible)
if (validationMiddleware && validationMiddleware.errorHandler) {
  app.use(validationMiddleware.errorHandler);
  console.log('✅ Gestionnaire d\'erreurs activé');
}

/* ---------------------- SERVEUR ----------------------- */
app.listen(port, () => {
  console.log(`✅ Serveur démarré sur le port ${port}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`🩺 Health check: http://localhost:${port}/health`);
  console.log(`📦 Test routes: http://localhost:${port}/api/items/test`);
});