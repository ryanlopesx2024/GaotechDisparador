const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users/users.controller');

// Log de rotas registradas
console.log('Registrando rotas de Usuários...');
console.log('- GET / - Listar todos os usuários');
console.log('- POST / - Adicionar usuário');
console.log('- GET /:id - Obter usuário por ID');
console.log('- PUT /:id - Atualizar usuário');
console.log('- DELETE /:id - Excluir usuário');
console.log('- GET /filter - Filtrar usuários por tags');
console.log('- GET /with-email - Obter usuários com email');
console.log('- GET /with-phone - Obter usuários com telefone');
console.log('- POST /import - Importar usuários');
console.log('- GET /tags - Obter todas as tags');
console.log('- POST /import-contacts - Importar contatos do arquivo lista_contatos.json');

// Rotas de usuários
router.get('/', usersController.getAllUsers);
router.post('/', usersController.addUser);
router.get('/filter', usersController.filterUsersByTags);
router.get('/with-email', usersController.getUsersWithEmail);
router.get('/with-phone', usersController.getUsersWithPhone);
router.post('/import', usersController.importUsers);
router.get('/tags', usersController.getAllTags);
router.post('/import-contacts', usersController.reimportContacts);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.delete('/', usersController.deleteAllUsers);

// Middleware para lidar com rotas não encontradas
router.use((req, res) => {
    console.log(`Rota não encontrada nas Usuários: ${req.method} ${req.path}`);
    res.status(404).json({ 
        error: 'Rota não encontrada',
        message: `A rota ${req.path} não existe nas usuários.`,
        availableRoutes: {
            all: 'GET /api/users',
            add: 'POST /api/users',
            getById: 'GET /api/users/:id',
            update: 'PUT /api/users/:id',
            delete: 'DELETE /api/users/:id',
            filter: 'GET /api/users/filter?tags=tag1,tag2',
            withEmail: 'GET /api/users/with-email',
            withPhone: 'GET /api/users/with-phone',
            import: 'POST /api/users/import',
            tags: 'GET /api/users/tags',
            importContacts: 'POST /api/users/import-contacts'
        }
    });
});

module.exports = router; 