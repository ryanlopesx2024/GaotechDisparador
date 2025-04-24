const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const UserDTO = require('../models/userDTO');

// Caminho para o arquivo de dados de usuários
const dataPath = path.join(__dirname, '../../data/users.json');

// Array para armazenar os usuários em memória
let users = [];

// Função para carregar os usuários do arquivo
const loadUsers = async () => {
  try {
    // Verificar se o diretório existe, se não, criá-lo
    const dataDir = path.join(__dirname, '../../data');
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Verificar se o arquivo existe
    try {
      await fs.access(dataPath);
      const data = await fs.readFile(dataPath, 'utf8');
      users = JSON.parse(data);
    } catch (error) {
      // Se o arquivo não existir, inicializa com array vazio
      users = [];
      await saveUsers();
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    throw error;
  }
};

// Função para salvar os usuários no arquivo
const saveUsers = async () => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar usuários:', error);
    throw error;
  }
};

// Carregar usuários ao iniciar
loadUsers().catch(console.error);

// Controllers
const getUsers = async (req, res) => {
  try {
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

const createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Criar e validar o DTO
    const userDTO = new UserDTO(userData);
    const validationErrors = userDTO.validate();
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    // Adicionar o usuário ao array
    users.push(userDTO);
    
    // Salvar as alterações no arquivo
    await saveUsers();
    
    res.status(201).json(userDTO);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(user => user.id === id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    // Verificar se o usuário existe
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Criar e validar o DTO
    const existingUser = users[userIndex];
    const userDTO = new UserDTO({
      ...existingUser,
      ...userData,
      id, // Manter o ID original
      createdAt: existingUser.createdAt // Manter a data de criação original
    });
    
    const validationErrors = userDTO.validate();
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    // Atualizar o usuário no array
    users[userIndex] = userDTO;
    
    // Salvar as alterações no arquivo
    await saveUsers();
    
    res.status(200).json(userDTO);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Remover o usuário do array
    users.splice(userIndex, 1);
    
    // Salvar as alterações no arquivo
    await saveUsers();
    
    res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    // Limpar o array de usuários
    users.length = 0;
    
    // Salvar as alterações no arquivo
    await saveUsers();
    
    res.status(200).json({ message: 'Todos os usuários foram excluídos com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir todos os usuários:', error);
    res.status(500).json({ error: 'Erro ao excluir todos os usuários' });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  deleteAllUsers
}; 