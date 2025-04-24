const express = require('express');
const mailController = require('../controllers/mail/mail.controller');

const router = express.Router();

// Rota para enviar email
router.post('/sendEmail', mailController.sendEmail);

// Rota para obter logs de email
router.get('/logs', mailController.getEmailLogs);

// Rota para verificar configuração de email
router.get('/check', mailController.checkEmailConfig);

// Middleware para lidar com rotas não encontradas
router.use((req, res) => {
  res.status(404).json({ error: 'Rota de email não encontrada' });
});

module.exports = router; 