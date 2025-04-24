const express = require('express');
const emailRouter = express.Router();

const emailController = require('../controllers/mailer/nodemailer.controller');


emailRouter.post('/sendEmail', emailController.sendEmail)
emailRouter.post('/sendMailHtml', emailController.sendMailHtml)

module.exports = emailRouter