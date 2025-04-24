const axios = require('axios');
const apikey = process.env.EVOLUTION_KEY;
const baseUrl = process.env.EVOLUTION_API_URL;
const instanceKey = process.env.EVOLUTION_INSTANCE_KEY;
const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
const metricsController = require('../metrics/metrics.controller');

class EvolutionController {
    async sendMessage(req, res) {
        console.log('Recebendo solicitação para enviar mensagem:', req.body);
        try {
            const { number, text, instance_name } = req.body;
            
            if (!number || !text) {
                return res.status(400).json({ 
                    error: 'Parâmetros inválidos',
                    message: 'Número e texto da mensagem são obrigatórios'
                });
            }
            
            // Se instance_name não for fornecido, use o valor padrão
            const instanceNameToUse = instance_name || instanceName || 'desenvolvimento';

            const data = JSON.stringify({
                "number": number,
                "text": text
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `https://evo.gaotech.com.br/message/sendText/${instanceNameToUse}`,
                headers: { 
                    'Content-Type': 'application/json', 
                    'apikey': apikey || 'UklGI3tPTtMAe5umB8D68RAZFRxP4UNj'
                },
                data: data
            };

            try {
                const response = await axios.request(config);
                console.log('Resposta da Evolution:', response.data);
                // Registrar sucesso nas métricas
                metricsController.registerWhatsAppSend(number, true);
                return res.status(200).json(response.data);
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
                // Registrar falha nas métricas
                metricsController.registerWhatsAppSend(number, false);
                
                // Formatar resposta de erro de forma consistente
                return res.status(error.response?.status || 500).json({
                    error: 'Erro ao enviar mensagem',
                    details: error.response?.data || error.message,
                    status: error.response?.status || 500
                });
            }
        } catch (error) {
            console.error('Erro geral na função sendMessage:', error);
            // Se o número estiver disponível no corpo da requisição, registre a falha
            if (req.body && req.body.number) {
                metricsController.registerWhatsAppSend(req.body.number, false);
            }
            
            return res.status(500).json({
                error: 'Erro interno ao processar solicitação',
                message: error.message
            });
        }
    }

    async getInstances(req, res) {
        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${baseUrl}/instance/fetchInstances`,
                headers: { 
                    'apikey': apikey,
                    'instance-key': instanceKey
                }
            };

            console.log('Buscando instâncias:', config.url);
            const response = await axios.request(config);
            console.log('Instâncias encontradas:', response.data);
            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error getting instances:', error.response?.data || error.message);
            res.status(500).json({ 
                error: 'Error getting instances', 
                details: error.response?.data || error.message 
            });
        }
    }

    async sendMedia(req, res) {
        try {
            const { number, media, instance_name } = req.body;

            if (!number || !media) {
                return res.status(400).json({ 
                    error: 'Parâmetros inválidos',
                    message: 'Número e mídia são obrigatórios'
                });
            }
            
            // Se instance_name não for fornecido, use o valor padrão
            const instanceNameToUse = instance_name || instanceName || 'desenvolvimento';

            const data = JSON.stringify({
                "number": number,
                "media": media
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${baseUrl || 'https://evo.gaotech.com.br'}/message/sendMedia/${instanceNameToUse}`,
                headers: { 
                    'Content-Type': 'application/json', 
                    'apikey': apikey || 'UklGI3tPTtMAe5umB8D68RAZFRxP4UNj'
                },
                data: data
            };

            console.log('Enviando mídia:', {
                url: config.url,
                number: number,
                media: media,
                instance: instanceNameToUse
            });

            try {
                const response = await axios.request(config);
                console.log('Resposta da Evolution:', response.data);
                // Registrar sucesso nas métricas
                metricsController.registerWhatsAppSend(number, true);
                return res.status(200).json(response.data);
            } catch (error) {
                console.error('Error sending media:', error.response?.data || error.message);
                // Registrar falha nas métricas
                metricsController.registerWhatsAppSend(number, false);
                
                // Formatar resposta de erro de forma consistente
                return res.status(error.response?.status || 500).json({
                    error: 'Erro ao enviar mídia',
                    details: error.response?.data || error.message,
                    status: error.response?.status || 500
                });
            }
        } catch (error) {
            console.error('Error in sendMedia function:', error.message);
            // Se o número estiver disponível no corpo da requisição, registre a falha
            if (req.body && req.body.number) {
                metricsController.registerWhatsAppSend(req.body.number, false);
            }
            
            return res.status(500).json({
                error: 'Erro interno ao processar solicitação de mídia',
                message: error.message
            });
        }
    }
    
    // Método simples para teste de conexão
    async testConnection(req, res) {
        try {
            return res.status(200).json({
                status: 'success',
                message: 'API de Evolution está funcionando corretamente',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Erro ao testar conexão',
                message: error.message
            });
        }
    }
}

module.exports = new EvolutionController();