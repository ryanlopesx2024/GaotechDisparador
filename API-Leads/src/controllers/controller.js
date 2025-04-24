require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { response } = require('express');
const { json } = require('stream/consumers');

const getContatos = async (req, res) => {
    try {
        if (!res) {
            console.error("Erro: O objeto 'res' não foi passado para a função.");
            return;
        }

        const API_URL = "https://gaotech.com.br/suporte/api/prospectus_contacts";
        const filePath = path.join(__dirname, '../lista_contatos.json');

        let allContacts = [];
        let nextPageUrl = `${API_URL}?page=1`;
        let page = 1;

        while (nextPageUrl) {
            console.log(`Buscando página ${page}...`);

            const response = await axios.get(nextPageUrl, {
                auth: {
                    username: process.env.USER_API,
                    password: process.env.PASSWORD_API
                }
            });

            if (!response.data || !response.data.data) {
                console.log("Resposta vazia da API. Finalizando busca.");
                break;
            }

            const { data, next_page_url, last_page, current_page } = response.data;

            if (Array.isArray(data) && data.length > 0) {
                allContacts.push(...data);
                console.log(`Página ${current_page}/${last_page} carregada com ${data.length} contatos.`);
            } else {
                console.log("Nenhum dado recebido nesta página. Finalizando busca.");
                break;
            }

            nextPageUrl = next_page_url;
            page++;
        }

        if (allContacts.length === 0) {
            return res.status(204).json({ message: "Nenhum contato encontrado" });
        }

        let ultimoContato = allContacts[allContacts.length - 1];
        let totalContatos = allContacts.length;

        const formattedContacts = allContacts.map(contact => ({
            prospectus_contacts_id: contact.prospectus_contacts_id || "Não informado",
            nome_empresa: contact.company_name || "Não informado",
            nome_fantasia: contact.fantasy_name || "Não informado",
            nome_responsavel: contact.name_responsable || "Não informado",
            email: contact.email || "Não informado",
            estado: contact.state || "Não informado",
            cidade: contact.citie || "Não informado",
            telefone: contact.phone || "Não informado",
            telefone_secundario: contact.cellphone || "Não informado",
            setor: contact.sector || "Não informado",
            erp: contact.erp || "Não informado"
        }));

        const JSONTeste = {
            ultimoContato: ultimoContato,
            total: totalContatos,
            contatos: formattedContacts,
        };

        fs.writeFileSync(filePath, JSON.stringify(JSONTeste, null, 2));
        console.log(`Contatos salvos em: ${filePath}`);

        return res.status(200).json({
            message: "Busca completa!",
            total: formattedContacts.length,
            contatos: formattedContacts
        });

    } catch (error) {
        console.error("Erro ao buscar contatos:", error.message || error);

        if (res && !res.headersSent) {
            return res.status(500).json({ message: "Erro ao buscar contatos", error: error.message });
        }
    }
};

const insertContact = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../lista_contatos.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Arquivo de contatos nao encontrado" });
        }

        const fileData = fs.readFileSync(filePath, 'utf-8');
        const contatos = JSON.parse(fileData);

        if (!contatos.contatos) {
            contatos.contatos = []; // Evita erro caso "contatos" não tenha a propriedade "contatos"
        }

        const response = await axios.get('https://gaotech.com.br/suporte/api/prospectus_contacts?page=1', {
            auth: {
                username: process.env.USER_API,
                password: process.env.PASSWORD_API
            }
        });

        console.log(`Total de contatos na API: ${response.data.total}`);
        console.log(`Total de contatos no lista_contatos.json: ${contatos.total}`);

        const apiContacts = response.data.data;
        let localContacts = contatos.contatos;

        //cria um set dos contatos (percorrendo toda a lista)
        const existingIds = new Set(localContacts.map(c => String(c.prospectus_contacts_id)));

        //filtra os contatos da API que não estão na lista local
        const newContacts = apiContacts.filter(contact => !existingIds.has(String(contact.prospectus_contacts_id)));

        console.log(`Novos contatos a serem adicionados: ${newContacts.length}`);

        if (newContacts.length > 0) {
            //adiciona os novos contatos na lista_contatos.json
            contatos.contatos.push(...newContacts.map(contact => ({
                prospectus_contacts_id: contact.prospectus_contacts_id,
                nome_empresa: contact.company_name || "Não informado",
                nome_fantasia: contact.fantasy_name || "Não informado",
                nome_responsavel: contact.name_responsable || "Não informado",
                email: contact.email || "Não informado",
                estado: contact.state || "Não informado",
                cidade: contact.citie || "Não informado",
                telefone: contact.phone || "Não informado",
                telefone_secundario: contact.cellphone || "Não informado",
                setor: contact.sector || "Não informado",
                erp: contact.erp || "Não informado"
            })));
            
            contatos.total = contatos.contatos.length;
            fs.writeFileSync(filePath, JSON.stringify(contatos, null, 2), 'utf-8');
            console.log(`${newContacts.length} novos contatos adicionados.`);
        } else {
            console.log("Nenhum novo contato encontrado.");
        }

        return res.status(200).json({ message: "Contatos atualizados com sucesso.", total: contatos.contatos.length, contatos: contatos.contatos });
    } catch (error) {
        console.error("Erro ao inserir contato:", error.message || error);
        res.status(500).json({ message: "Erro ao inserir contato", error: error.message });
    }
};

const filterContacts = async (req, res) => {
    try {
        const inputFilePath = path.join(__dirname, '../lista_contatos.json');
        const outputFilePath = path.join(__dirname, '../contatos_filtrados.json');

        if (!fs.existsSync(inputFilePath)) {
            return res.status(404).json({ message: "Arquivo de contatos não encontrado" });
        }

        const fileData = fs.readFileSync(inputFilePath, 'utf-8');
        const contatos = JSON.parse(fileData);

        const { estado, cidade, erp, setor } = req.query;

        let contatosFiltrados = contatos.contatos;

        if (estado) {
            contatosFiltrados = contatosFiltrados.filter(contato =>
                contato.estado.toLowerCase() === estado.toLowerCase()
            );
        }

        if (cidade) {
            contatosFiltrados = contatosFiltrados.filter(contato =>
                contato.cidade.toLowerCase() === cidade.toLowerCase()
            );
        }

        if (erp) {
            contatosFiltrados = contatosFiltrados.filter(contato =>
                contato.erp.toLowerCase() === erp.toLowerCase()
            );
        }

        if (setor) {
            contatosFiltrados = contatosFiltrados.filter(contato =>
                contato.setor.toLowerCase() === setor.toLowerCase()
            );
        }

        const resultado = {
            total: contatosFiltrados.length,
            filtros_aplicados: { estado, cidade, erp, setor },
            contatos: contatosFiltrados
        };

        fs.writeFileSync(outputFilePath, JSON.stringify(resultado, null, 2), 'utf-8');
        console.log(`Contatos filtrados salvos em: ${outputFilePath}`);

        return res.status(200).json({
            message: "Contatos filtrados com sucesso",
            total: resultado.total,
            contatos: resultado.contatos
        });
    } catch (error) {
        console.error("Erro ao filtrar contatos:", error.message || error);
        return res.status(500).json({ message: "Erro ao filtrar contatos", error: error.message });
    }
};

module.exports = {
    getContatos,
    insertContact,
    filterContacts
};