// Armazenamento em memória para métricas (em produção, deveria ser um banco de dados)
let metrics = {
    whatsapp: {
        total: 0,
        success: 0,
        failed: 0,
        byDay: {},
        byNumber: {}
    },
    email: {
        total: 0,
        success: 0,
        failed: 0,
        byDay: {},
        byEmail: {}
    }
};

class MetricsController {
    // Registrar envio de WhatsApp
    registerWhatsAppSend(number, success) {
        const today = new Date().toISOString().split('T')[0];
        
        // Incrementar contadores
        metrics.whatsapp.total++;
        if (success) {
            metrics.whatsapp.success++;
        } else {
            metrics.whatsapp.failed++;
        }
        
        // Registrar por dia
        if (!metrics.whatsapp.byDay[today]) {
            metrics.whatsapp.byDay[today] = { total: 0, success: 0, failed: 0 };
        }
        metrics.whatsapp.byDay[today].total++;
        if (success) {
            metrics.whatsapp.byDay[today].success++;
        } else {
            metrics.whatsapp.byDay[today].failed++;
        }
        
        // Registrar por número
        if (!metrics.whatsapp.byNumber[number]) {
            metrics.whatsapp.byNumber[number] = { total: 0, success: 0, failed: 0 };
        }
        metrics.whatsapp.byNumber[number].total++;
        if (success) {
            metrics.whatsapp.byNumber[number].success++;
        } else {
            metrics.whatsapp.byNumber[number].failed++;
        }
    }
    
    // Registrar envio de e-mail
    registerEmailSend(email, success) {
        const today = new Date().toISOString().split('T')[0];
        
        // Incrementar contadores
        metrics.email.total++;
        if (success) {
            metrics.email.success++;
        } else {
            metrics.email.failed++;
        }
        
        // Registrar por dia
        if (!metrics.email.byDay[today]) {
            metrics.email.byDay[today] = { total: 0, success: 0, failed: 0 };
        }
        metrics.email.byDay[today].total++;
        if (success) {
            metrics.email.byDay[today].success++;
        } else {
            metrics.email.byDay[today].failed++;
        }
        
        // Registrar por e-mail
        if (!metrics.email.byEmail[email]) {
            metrics.email.byEmail[email] = { total: 0, success: 0, failed: 0 };
        }
        metrics.email.byEmail[email].total++;
        if (success) {
            metrics.email.byEmail[email].success++;
        } else {
            metrics.email.byEmail[email].failed++;
        }
    }
    
    // Obter todas as métricas
    getMetrics(req, res) {
        res.status(200).json(metrics);
    }
    
    // Obter métricas de WhatsApp
    getWhatsAppMetrics(req, res) {
        res.status(200).json(metrics.whatsapp);
    }
    
    // Obter métricas de e-mail
    getEmailMetrics(req, res) {
        res.status(200).json(metrics.email);
    }
    
    // Obter métricas por dia
    getMetricsByDay(req, res) {
        const result = {
            whatsapp: metrics.whatsapp.byDay,
            email: metrics.email.byDay
        };
        res.status(200).json(result);
    }
    
    // Obter resumo de métricas
    getMetricsSummary(req, res) {
        const result = {
            whatsapp: {
                total: metrics.whatsapp.total,
                success: metrics.whatsapp.success,
                failed: metrics.whatsapp.failed,
                successRate: metrics.whatsapp.total > 0 ? (metrics.whatsapp.success / metrics.whatsapp.total * 100).toFixed(2) + '%' : '0%'
            },
            email: {
                total: metrics.email.total,
                success: metrics.email.success,
                failed: metrics.email.failed,
                successRate: metrics.email.total > 0 ? (metrics.email.success / metrics.email.total * 100).toFixed(2) + '%' : '0%'
            },
            total: {
                messages: metrics.whatsapp.total + metrics.email.total,
                success: metrics.whatsapp.success + metrics.email.success,
                failed: metrics.whatsapp.failed + metrics.email.failed
            }
        };
        res.status(200).json(result);
    }
}

module.exports = new MetricsController(); 