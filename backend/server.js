require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_PROVIDER,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes

// 1. List all contacts
app.get('/api/contatos', (req, res) => {
    try {
        const contacts = JSON.parse(fs.readFileSync('lista_contatos.json', 'utf8'));
        res.json({ contatos: contacts });
    } catch (error) {
        res.status(500).json({ error: 'Error reading contacts file' });
    }
});

// 2. Insert new contacts
app.get('/api/teste', async (req, res) => {
    try {
        const response = await axios.get(`${process.env.EVOLUTION_API_URL}/api/contatos`);
        const apiContacts = response.data.contatos;
        
        let localContacts = [];
        try {
            localContacts = JSON.parse(fs.readFileSync('lista_contatos.json', 'utf8'));
        } catch (error) {
            // File doesn't exist, will be created
        }

        const newContacts = apiContacts.filter(apiContact => 
            !localContacts.some(localContact => 
                localContact.prospectus_contacts_id === apiContact.prospectus_contacts_id
            )
        );

        const updatedContacts = [...localContacts, ...newContacts];
        fs.writeFileSync('lista_contatos.json', JSON.stringify(updatedContacts, null, 2));

        res.json({
            message: 'Contacts updated successfully',
            totalApiContacts: apiContacts.length,
            totalLocalContacts: updatedContacts.length,
            newContactsAdded: newContacts.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating contacts' });
    }
});

// 3. Send media
app.post('/api/evo/sendMedia', async (req, res) => {
    try {
        const { number, media, instance_name } = req.body;
        const response = await axios.post(`${process.env.EVOLUTION_API_URL}/api/evo/sendMedia`, {
            number,
            media,
            instance_name: instance_name || process.env.EVOLUTION_INSTANCE_NAME
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error sending media' });
    }
});

// 4. Send email
app.post('/api/evo/sendEmail', async (req, res) => {
    try {
        const { to, subject, text, provider } = req.body;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending email' });
    }
});

// 5. Send WhatsApp message
app.post('/api/evo/sendMessage', async (req, res) => {
    try {
        const { number, text, instance_name } = req.body;
        const response = await axios.post(`${process.env.EVOLUTION_API_URL}/api/evo/sendMessage`, {
            number,
            text,
            instance_name: instance_name || process.env.EVOLUTION_INSTANCE_NAME
        });
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error?.response?.data || error.message || error);
        res.status(500).json({ error: error?.response?.data || error.message || 'Error sending message' });
    }
});

// 6. Get Evolution instances
app.get('/api/evo/getInstances', async (req, res) => {
    try {
        const response = await axios.get(`${process.env.EVOLUTION_API_URL}/api/evo/getInstances`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error getting instances' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 