const express = require('express');
const router = express.Router();

const evolutionController = require('../controllers/evolution/evolution.controller');

// Log de rotas registradas
console.log('Registrando rotas do Evolution...');
console.log('- POST /sendMessage');
console.log('- GET /getInstances');
console.log('- POST /sendMedia');
console.log('- GET /test');
console.log('- GET /connection-test');

// Rotas do Evolution
router.post('/sendMessage', evolutionController.sendMessage);    // Enviar mensagem via WhatsApp
router.get('/getInstances', evolutionController.getInstances);   // Pegar todas as instâncias
router.post('/sendMedia', evolutionController.sendMedia);        // Enviar mídia

// Rota de teste
router.get('/test', (req, res) => {
    res.json({ message: 'API Evolution está funcionando!' });
});

router.get('/connection-test', evolutionController.testConnection);

// Middleware para lidar com rotas não encontradas
router.use((req, res) => {
    console.log(`Rota não encontrada no Evolution: ${req.method} ${req.path}`);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        message: `A rota ${req.path} não existe no Evolution.`,
        availableRoutes: {
            sendMessage: 'POST /api/evo/sendMessage',
            getInstances: 'GET /api/evo/getInstances',
            sendMedia: 'POST /api/evo/sendMedia',
            test: 'GET /api/evo/test',
            connectionTest: 'GET /api/evo/connection-test'
        }
    });
});

module.exports = router;