const express = require('express');
const router = express.Router();
const bulkController = require('../controllers/bulk/bulk.controller');

// Log de rotas registradas
console.log('Registrando rotas de Envio em Massa...');
console.log('- POST /whatsapp/users - Enviar WhatsApp para usuários específicos');
console.log('- POST /email/users - Enviar email para usuários específicos');
console.log('- POST /whatsapp/tags - Enviar WhatsApp para usuários por tags');
console.log('- POST /email/tags - Enviar email para usuários por tags');

// Rotas para envio em massa
router.post('/whatsapp/users', bulkController.sendWhatsAppToUsers);
router.post('/email/users', bulkController.sendEmailToUsers);
router.post('/whatsapp/tags', bulkController.sendWhatsAppByTags);
router.post('/email/tags', bulkController.sendEmailByTags);

// Middleware para lidar com rotas não encontradas
router.use((req, res) => {
    console.log(`Rota não encontrada no Bulk: ${req.method} ${req.path}`);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        message: `A rota ${req.path} não existe no módulo de envio em massa.`,
        availableRoutes: {
            whatsappUsers: 'POST /api/bulk/whatsapp/users',
            emailUsers: 'POST /api/bulk/email/users',
            whatsappTags: 'POST /api/bulk/whatsapp/tags',
            emailTags: 'POST /api/bulk/email/tags'
        }
    });
});

module.exports = router; 