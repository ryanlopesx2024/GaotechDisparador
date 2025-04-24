const express = require('express');
const router = express.Router();

// Importando o controller
const controller = require('../controllers/controller');


router.get('/contatos', controller.getContatos);
router.get('/teste', controller.insertContact);
router.get('/contatos/filter', controller.filterContacts);


module.exports = router;