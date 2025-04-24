const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metrics/metrics.controller');

// Log de rotas registradas
console.log('Registrando rotas de Métricas...');
console.log('- GET /all - Todas as métricas');
console.log('- GET /whatsapp - Métricas de WhatsApp');
console.log('- GET /email - Métricas de e-mail');
console.log('- GET /byDay - Métricas por dia');
console.log('- GET /summary - Resumo das métricas');

// Rotas de métricas
router.get('/all', metricsController.getMetrics);
router.get('/whatsapp', metricsController.getWhatsAppMetrics);
router.get('/email', metricsController.getEmailMetrics);
router.get('/byDay', metricsController.getMetricsByDay);
router.get('/summary', metricsController.getMetricsSummary);

// Middleware para lidar com rotas não encontradas
router.use((req, res) => {
    console.log(`Rota não encontrada nas Métricas: ${req.method} ${req.path}`);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        message: `A rota ${req.path} não existe nas métricas.`,
        availableRoutes: {
            all: 'GET /api/metrics/all',
            whatsapp: 'GET /api/metrics/whatsapp',
            email: 'GET /api/metrics/email',
            byDay: 'GET /api/metrics/byDay',
            summary: 'GET /api/metrics/summary'
        }
    });
});

module.exports = router; 