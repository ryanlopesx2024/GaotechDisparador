require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const apiRoutes = require('./routes/routes');
const evoRoutes = require('./routes/evoRoutes');
const emailRoutes = require('./routes/emailRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const userRoutes = require('./routes/userRoutes');
const bulkRoutes = require('./routes/bulkRoutes');
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Log de rotas registradas
console.log('Registrando rotas...');
console.log('- /api');
console.log('- /api/evo');
console.log('- /api/mail');
console.log('- /api/metrics');
console.log('- /api/users');
console.log('- /api/bulk');

// Rotas
app.use('/api', apiRoutes);       // ROTAS GERAIS
app.use('/api/evo', evoRoutes);    // ROTAS EVOLUTION
app.use('/api/mail', emailRoutes); // ROTAS DE EMAIL
app.use('/api/metrics', metricsRoutes); // ROTAS DE MÉTRICAS
app.use('/api/users', userRoutes); // ROTAS DE USUÁRIOS
app.use('/api/bulk', bulkRoutes); // ROTAS DE ENVIO EM MASSA

// Rota principal
app.get('/', (request, response) => {
    response.json({message: 'API LEADS Rodando... '});
});

// Rota de teste
app.get('/test', (req, res) => {
    res.json({ message: 'API está funcionando!' });
});

// Rota /emails que redireciona para /api/mail/sendEmail
app.post('/emails', (req, res) => {
    res.redirect('/api/mail/sendEmail');
});

// Middleware para lidar com rotas não encontradas
app.use((req, res) => {
    console.log(`Rota não encontrada: ${req.method} ${req.path}`);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        message: `A rota ${req.path} não existe. Verifique a documentação da API.`,
        availableRoutes: {
            email: '/api/mail/sendEmail',
            evolution: '/api/evo/sendMessage',
            metrics: '/api/metrics/summary',
            users: '/api/users',
            bulk: '/api/bulk',
            test: '/test'
        }
    });
});

// Middleware global para tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro no backend:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message || 'Erro desconhecido'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Rotas disponíveis:');
    console.log('- GET /test - Rota de teste');
    console.log('- POST /api/mail/sendEmail - Enviar email');
    console.log('- POST /api/evo/sendMessage - Enviar mensagem via Evolution');
    console.log('- GET /api/metrics/summary - Resumo das métricas');
    console.log('- GET /api/users - Listar usuários');
    console.log('- POST /api/bulk/whatsapp/users - Enviar WhatsApp para múltiplos usuários');
    console.log('- POST /api/bulk/email/users - Enviar email para múltiplos usuários');
    console.log('- POST /emails - Redireciona para /api/mail/sendEmail');
});
