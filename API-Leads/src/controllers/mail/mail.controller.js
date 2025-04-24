const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

dotenv.config();

// Log para registrar todos os e-mails enviados
const emailLogsPath = path.join(__dirname, '../../../data/email_logs.json');

// Função para carregar logs de e-mail
const loadEmailLogs = async () => {
  try {
    const dataDir = path.join(__dirname, '../../../data');
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
    }

    try {
      await fs.access(emailLogsPath);
      const data = await fs.readFile(emailLogsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      const initialLogs = [];
      await fs.writeFile(emailLogsPath, JSON.stringify(initialLogs, null, 2));
      return initialLogs;
    }
  } catch (error) {
    console.error('Erro ao carregar logs de e-mail:', error);
    return [];
  }
};

// Função para salvar logs de e-mail
const saveEmailLog = async (log) => {
  try {
    const logs = await loadEmailLogs();
    logs.unshift(log); // Adicionar no início da lista
    await fs.writeFile(emailLogsPath, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Erro ao salvar log de e-mail:', error);
  }
};

// Configurações dos transportadores de e-mail
const getTransporter = (provider = 'gmail') => {
  switch (provider.toLowerCase()) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    
    case 'outlook':
      return nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER_OUTLOOK || process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS_OUTLOOK || process.env.EMAIL_PASS
        }
      });
      
    case 'webmail':
      return nodemailer.createTransport({
        host: process.env.WEBMAIL_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.WEBMAIL_PORT || '587', 10),
        secure: process.env.WEBMAIL_SECURE === 'true',
        auth: {
          user: process.env.WEBMAIL_USER || process.env.EMAIL_USER,
          pass: process.env.WEBMAIL_PASS || process.env.EMAIL_PASS
        }
      });
      
    default:
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  }
};

// Controller para enviar e-mail
const sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html, provider = 'gmail', cc, bcc, attachments } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Destinatário é obrigatório' });
    }

    if (!subject) {
      return res.status(400).json({ error: 'Assunto é obrigatório' });
    }

    if (!text && !html) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório (text ou html)' });
    }

    const transporter = getTransporter(provider);

    const mailOptions = {
      from: provider === 'webmail' ? process.env.WEBMAIL_USER : process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text || '',
      html: html || text, // Usa text como HTML se html não for fornecido
    };

    // Adicionar cc, bcc e anexos se fornecidos
    if (cc) mailOptions.cc = cc;
    if (bcc) mailOptions.bcc = bcc;
    if (attachments && Array.isArray(attachments)) mailOptions.attachments = attachments;

    console.log(`Enviando e-mail para ${to} usando provedor: ${provider}`);
    const info = await transporter.sendMail(mailOptions);

    // Registrar log do e-mail enviado
    const emailLog = {
      id: Date.now().toString(),
      to: to,
      subject: subject,
      provider: provider,
      status: 'enviado',
      messageId: info.messageId,
      date: new Date().toISOString()
    };

    await saveEmailLog(emailLog);

    console.log('E-mail enviado:', info.messageId);
    res.status(200).json({ 
      success: true, 
      message: 'E-mail enviado com sucesso', 
      messageId: info.messageId,
      log: emailLog
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    
    // Registrar log do e-mail com falha
    try {
      const emailLog = {
        id: Date.now().toString(),
        to: req.body.to,
        subject: req.body.subject,
        provider: req.body.provider || 'gmail',
        status: 'falha',
        error: error.message,
        date: new Date().toISOString()
      };
      
      await saveEmailLog(emailLog);
    } catch (logError) {
      console.error('Erro ao salvar log de falha:', logError);
    }
    
    res.status(500).json({ 
      error: 'Erro ao enviar e-mail', 
      details: error.message, 
      provider: req.body.provider || 'gmail' 
    });
  }
};

// Controller para obter logs de e-mail
const getEmailLogs = async (req, res) => {
  try {
    const logs = await loadEmailLogs();
    res.status(200).json(logs);
  } catch (error) {
    console.error('Erro ao obter logs de e-mail:', error);
    res.status(500).json({ error: 'Erro ao obter logs de e-mail' });
  }
};

// Controller para verificar configuração de e-mail
const checkEmailConfig = async (req, res) => {
  try {
    const { provider = 'gmail' } = req.query;
    const transporter = getTransporter(provider);
    
    console.log(`Verificando configuração de e-mail para provedor: ${provider}`);
    
    await transporter.verify();
    
    console.log(`Configuração de e-mail verificada com sucesso para provedor: ${provider}`);
    res.status(200).json({ success: true, message: 'Configuração de e-mail verificada com sucesso' });
  } catch (error) {
    console.error(`Erro ao verificar configuração de e-mail para provedor ${req.query.provider || 'gmail'}:`, error);
    res.status(500).json({ error: 'Erro ao verificar configuração de e-mail', details: error.message });
  }
};

module.exports = {
  sendEmail,
  getEmailLogs,
  checkEmailConfig
}; 