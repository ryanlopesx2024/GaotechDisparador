const usersController = require('../users/users.controller');
const evolutionController = require('../evolution/evolution.controller');
const emailController = require('../mailer/nodemailer.controller');

class BulkController {
    // Enviar mensagem por WhatsApp para vários usuários
    async sendWhatsAppToUsers(req, res) {
        try {
            const { userIds, text, instance_name } = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ error: 'Lista de IDs de usuários é obrigatória' });
            }

            if (!text) {
                return res.status(400).json({ error: 'Texto da mensagem é obrigatório' });
            }

            // Obter usuários
            const allUsers = usersController.readUsersFromFile();
            const users = allUsers.filter(user => userIds.includes(user.id));

            if (users.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com os IDs fornecidos' });
            }

            // Filtrar usuários com número de telefone
            const usersWithPhone = users.filter(user => user.phone && user.phone.trim() !== '');

            if (usersWithPhone.length === 0) {
                return res.status(400).json({ error: 'Nenhum dos usuários selecionados possui número de telefone' });
            }

            // Enviar mensagens
            const results = [];
            const promises = [];

            for (const user of usersWithPhone) {
                const messagePromise = this.sendWhatsAppMessage(user, text, instance_name)
                    .then(result => {
                        results.push({
                            userId: user.id,
                            name: user.name,
                            phone: user.phone,
                            success: true,
                            message: result
                        });
                    })
                    .catch(error => {
                        results.push({
                            userId: user.id,
                            name: user.name,
                            phone: user.phone,
                            success: false,
                            error: error.message
                        });
                    });
                
                promises.push(messagePromise);
            }

            await Promise.allSettled(promises);

            // Contar sucessos e falhas
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            res.status(200).json({
                total: usersWithPhone.length,
                success: successCount,
                failed: failureCount,
                results
            });
        } catch (error) {
            console.error('Error sending bulk WhatsApp messages:', error);
            res.status(500).json({ error: 'Error sending bulk WhatsApp messages', details: error.message });
        }
    }

    // Enviar email para vários usuários
    async sendEmailToUsers(req, res) {
        try {
            const { userIds, subject, text, html } = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ error: 'Lista de IDs de usuários é obrigatória' });
            }

            if (!subject) {
                return res.status(400).json({ error: 'Assunto do email é obrigatório' });
            }

            if (!text && !html) {
                return res.status(400).json({ error: 'Texto ou HTML do email é obrigatório' });
            }

            // Obter usuários
            const allUsers = usersController.readUsersFromFile();
            const users = allUsers.filter(user => userIds.includes(user.id));

            if (users.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com os IDs fornecidos' });
            }

            // Filtrar usuários com email
            const usersWithEmail = users.filter(user => user.email && user.email.trim() !== '');

            if (usersWithEmail.length === 0) {
                return res.status(400).json({ error: 'Nenhum dos usuários selecionados possui email' });
            }

            // Enviar emails
            const results = [];
            const promises = [];

            for (const user of usersWithEmail) {
                const emailPromise = this.sendEmail(user, subject, text, html)
                    .then(result => {
                        results.push({
                            userId: user.id,
                            name: user.name,
                            email: user.email,
                            success: true,
                            message: result
                        });
                    })
                    .catch(error => {
                        results.push({
                            userId: user.id,
                            name: user.name,
                            email: user.email,
                            success: false,
                            error: error.message
                        });
                    });
                
                promises.push(emailPromise);
            }

            await Promise.allSettled(promises);

            // Contar sucessos e falhas
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            res.status(200).json({
                total: usersWithEmail.length,
                success: successCount,
                failed: failureCount,
                results
            });
        } catch (error) {
            console.error('Error sending bulk emails:', error);
            res.status(500).json({ error: 'Error sending bulk emails', details: error.message });
        }
    }

    // Enviar mensagem por WhatsApp para usuários filtrados por tags
    async sendWhatsAppByTags(req, res) {
        try {
            const { tags, text, instance_name } = req.body;

            if (!tags || !Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ error: 'Lista de tags é obrigatória' });
            }

            if (!text) {
                return res.status(400).json({ error: 'Texto da mensagem é obrigatório' });
            }

            // Obter usuários com as tags especificadas
            const allUsers = usersController.readUsersFromFile();
            const users = allUsers.filter(user => 
                user.tags && Array.isArray(user.tags) && 
                tags.some(tag => user.tags.includes(tag))
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com as tags fornecidas' });
            }

            // Filtrar usuários com número de telefone
            const usersWithPhone = users.filter(user => user.phone && user.phone.trim() !== '');

            if (usersWithPhone.length === 0) {
                return res.status(400).json({ error: 'Nenhum dos usuários filtrados possui número de telefone' });
            }

            // Enviar mensagens
            const results = [];
            const promises = [];

            for (const user of usersWithPhone) {
                const messagePromise = this.sendWhatsAppMessage(user, text, instance_name)
                    .then(result => {
                        results.push({
                            userId: user.id,
                            name: user.name,
                            phone: user.phone,
                            success: true,
                            message: result
                        });
                    })
                    .catch(error => {
                        results.push({
                            userId: user.id,
                            name: user.name,
                            phone: user.phone,
                            success: false,
                            error: error.message
                        });
                    });
                
                promises.push(messagePromise);
            }

            await Promise.allSettled(promises);

            // Contar sucessos e falhas
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            res.status(200).json({
                total: usersWithPhone.length,
                success: successCount,
                failed: failureCount,
                results
            });
        } catch (error) {
            console.error('Error sending WhatsApp messages by tags:', error);
            res.status(500).json({ error: 'Error sending WhatsApp messages by tags', details: error.message });
        }
    }

    // Enviar email para usuários filtrados por tags
    async sendEmailByTags(req, res) {
        try {
            const { tags, subject, text, html } = req.body;

            if (!tags || !Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ error: 'Lista de tags é obrigatória' });
            }

            if (!subject) {
                return res.status(400).json({ error: 'Assunto do email é obrigatório' });
            }

            if (!text && !html) {
                return res.status(400).json({ error: 'Texto ou HTML do email é obrigatório' });
            }

            // Obter usuários com as tags especificadas
            const allUsers = usersController.readUsersFromFile();
            const users = allUsers.filter(user => 
                user.tags && Array.isArray(user.tags) && 
                tags.some(tag => user.tags.includes(tag))
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com as tags fornecidas' });
            }

            // Filtrar usuários com email
            const usersWithEmail = users.filter(user => user.email && user.email.trim() !== '');

            if (usersWithEmail.length === 0) {
                return res.status(400).json({ error: 'Nenhum dos usuários filtrados possui email' });
            }

            // Enviar emails
            const results = [];
            const promises = [];

            for (const user of usersWithEmail) {
                const emailPromise = this.sendEmail(user, subject, text, html)
                    .then(result => {
                        results.push({
                            userId: user.id,
                            name: user.name,
                            email: user.email,
                            success: true,
                            message: result
                        });
                    })
                    .catch(error => {
                        results.push({
                            userId: user.id,
                            name: user.name,
                            email: user.email,
                            success: false,
                            error: error.message
                        });
                    });
                
                promises.push(emailPromise);
            }

            await Promise.allSettled(promises);

            // Contar sucessos e falhas
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            res.status(200).json({
                total: usersWithEmail.length,
                success: successCount,
                failed: failureCount,
                results
            });
        } catch (error) {
            console.error('Error sending emails by tags:', error);
            res.status(500).json({ error: 'Error sending emails by tags', details: error.message });
        }
    }

    // Métodos auxiliares

    // Enviar mensagem WhatsApp para um usuário
    async sendWhatsAppMessage(user, text, instance_name) {
        return new Promise((resolve, reject) => {
            // Preparar o corpo da requisição para o controlador de Evolution
            const mockReq = {
                body: {
                    number: user.phone,
                    text,
                    instance_name
                }
            };

            // Criar um objeto de resposta simulado
            const mockRes = {
                status: (statusCode) => {
                    return {
                        json: (data) => {
                            if (statusCode === 200) {
                                resolve(data);
                            } else {
                                reject(new Error(data.error || 'Erro ao enviar mensagem'));
                            }
                        }
                    };
                }
            };

            // Chamar o método sendMessage do controlador de Evolution
            evolutionController.sendMessage(mockReq, mockRes);
        });
    }

    // Enviar email para um usuário
    async sendEmail(user, subject, text, html) {
        return new Promise((resolve, reject) => {
            // Preparar o corpo da requisição para o controlador de Email
            const mockReq = {
                body: {
                    to: user.email,
                    subject,
                    text,
                    html
                }
            };

            // Criar um objeto de resposta simulado
            const mockRes = {
                status: (statusCode) => {
                    return {
                        json: (data) => {
                            if (statusCode === 200) {
                                resolve(data);
                            } else {
                                reject(new Error(data.error || 'Erro ao enviar email'));
                            }
                        }
                    };
                },
                json: (data) => {
                    resolve(data);
                }
            };

            // Chamar o método sendEmail ou sendMailHtml do controlador de Email
            if (html) {
                emailController.sendMailHtml(mockReq, mockRes);
            } else {
                emailController.sendEmail(mockReq, mockRes);
            }
        });
    }
}

module.exports = new BulkController(); 