const nodemailer = require('nodemailer')
const metricsController = require('../metrics/metrics.controller');

const WEBMAIL_USER = process.env.EMAIL_USER
const WEBMAIL_PASS = process.env.EMAIL_PASS
const EMAIL_HOST = process.env.EMAIL_HOST
const EMAIL_PORT = process.env.EMAIL_PORT
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true'

class MailerController {
    async sendEmail(req, res) {
        try {
            const { to, subject, text } = req.body

            const transporter = nodemailer.createTransport({
                host: EMAIL_HOST,
                port: EMAIL_PORT,
                secure: EMAIL_SECURE,
                    auth: {
                        user: WEBMAIL_USER,
                        pass: WEBMAIL_PASS,
                    },
                    tls: {
                    rejectUnauthorized: false
                }
            })

            const mailOptions = {
                from: WEBMAIL_USER,
                to,
                subject,
                text,
            }

            await transporter.sendMail(mailOptions)
            // Registrar sucesso nas métricas
            metricsController.registerEmailSend(to, true);
            res.json({ message: 'Email sent successfully' })
        } catch (error) {
            console.error('Error sending email:', error)
            // Registrar falha nas métricas
            if (req.body && req.body.to) {
                metricsController.registerEmailSend(req.body.to, false);
            }
            res.status(500).json({ error: 'Error sending email', details: error.message })
        }
    }

    async sendMailHtml(req, res) {
        try {
            const { to, subject, html } = req.body

            const transporter = nodemailer.createTransport({
                host: EMAIL_HOST,
                port: EMAIL_PORT,
                secure: EMAIL_SECURE,
                    auth: {
                        user: WEBMAIL_USER,
                        pass: WEBMAIL_PASS,
                    },
                tls: {
                    rejectUnauthorized: false
                }
            })

            const mailOptions = {
                from: WEBMAIL_USER,
                to,
                subject,
                html,
            }

            await transporter.sendMail(mailOptions)
            // Registrar sucesso nas métricas
            metricsController.registerEmailSend(to, true);
            res.json({ message: 'Email sent successfully' })
        } catch (error) {
            console.error('Error sending email:', error)
            // Registrar falha nas métricas
            if (req.body && req.body.to) {
                metricsController.registerEmailSend(req.body.to, false);
            }
            res.status(500).json({ error: 'Error sending email', details: error.message })
        }
    }
}

module.exports = new MailerController()
