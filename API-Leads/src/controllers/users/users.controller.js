const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Caminho para o arquivo de usuários
const usersFilePath = path.join(__dirname, '../../data/users.json');

// Garantir que o diretório data existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Função para importar contatos do arquivo lista_contatos.json
const importContactsFromFile = () => {
  try {
    // Tentar diversos caminhos possíveis para o arquivo lista_contatos.json
    const possiblePaths = [
      path.join(__dirname, '../../lista_contatos.json'),
      path.join(__dirname, '../../../lista_contatos.json'),
      path.join(__dirname, '../../../backend/lista_contatos.json'),
      path.join(__dirname, '../../src/lista_contatos.json')
    ];
    
    let contactsFilePath = null;
    
    // Verificar qual caminho existe
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        contactsFilePath = filePath;
        console.log(`Arquivo lista_contatos.json encontrado em: ${filePath}`);
        break;
      }
    }
    
    if (!contactsFilePath) {
      console.error('Arquivo lista_contatos.json não encontrado em nenhum dos caminhos esperados');
      return { users: [], tags: [] };
    }
    
    // Ler o arquivo de contatos
    const contactsData = fs.readFileSync(contactsFilePath, 'utf8');
    const contacts = JSON.parse(contactsData);
    
    // Transformar contatos para o formato de usuários
    const users = contacts.contatos.map(contact => {
      // Determinar as tags com base nos dados do contato
      const tags = [];
      
      // Tag baseada no setor
      if (contact.setor) {
        tags.push(contact.setor.toLowerCase());
      }
      
      // Tag baseada no ERP
      if (contact.erp && contact.erp !== "Não informado") {
        tags.push(`erp-${contact.erp.toLowerCase()}`);
      }
      
      // Tag baseada no estado
      if (contact.estado) {
        tags.push(`estado-${contact.estado.toLowerCase()}`);
      }
      
      // Tag se tiver email
      if (contact.email && contact.email !== "Não informado") {
        tags.push('com-email');
      }
      
      // Tag se tiver telefone
      if ((contact.telefone && contact.telefone !== "Não informado") || 
          (contact.telefone_secundario && contact.telefone_secundario !== "Não informado")) {
        tags.push('com-telefone');
      }
      
      // Criar objeto de usuário
      return {
        id: uuidv4(),
        name: contact.nome_responsavel || contact.nome_fantasia || contact.nome_empresa || 'Sem nome',
        email: contact.email && contact.email !== "Não informado" ? contact.email : '',
        phone: contact.telefone && contact.telefone !== "Não informado" ? contact.telefone : 
               (contact.telefone_secundario && contact.telefone_secundario !== "Não informado" ? contact.telefone_secundario : ''),
        tags: tags,
        empresa: contact.nome_fantasia || contact.nome_empresa || '',
        estado: contact.estado || '',
        cidade: contact.cidade || '',
        createdAt: new Date().toISOString()
      };
    });
    
    // Obter todas as tags únicas
    const allTags = [];
    users.forEach(user => {
      user.tags.forEach(tag => {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      });
    });
    
    console.log(`Importados ${users.length} usuários com ${allTags.length} tags diferentes`);
    
    return { users, tags: allTags };
  } catch (error) {
    console.error('Erro ao importar contatos:', error);
    return { users: [], tags: [] };
  }
};

// Garantir que o arquivo de usuários existe
if (!fs.existsSync(usersFilePath)) {
  // Importar contatos do arquivo lista_contatos.json
  const { users, tags } = importContactsFromFile();
  
  fs.writeFileSync(
    usersFilePath,
    JSON.stringify({ users, tags }, null, 2)
  );
} else {
  // Recarregar os contatos do arquivo lista_contatos.json
  // Sobrescrever o arquivo users.json com os contatos da lista
  const { users, tags } = importContactsFromFile();
  if (users.length > 0) {
    console.log(`Recarregando lista com ${users.length} contatos`);
    fs.writeFileSync(
      usersFilePath,
      JSON.stringify({ users, tags }, null, 2)
    );
  }
}

// Função para ler os usuários do arquivo
const getUsers = () => {
  try {
    const fileData = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Erro ao ler arquivo de usuários:', error);
    return { users: [], tags: [] };
  }
};

// Função para salvar os usuários no arquivo
const saveUsers = (data) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar arquivo de usuários:', error);
    return false;
  }
};

// Função para forçar a importação de contatos
const forceImportContacts = () => {
  try {
    // Criar um array vazio de usuários e tags
    const emptyData = { users: [], tags: [] };
    
    // Salvar o array vazio no arquivo
    saveUsers(emptyData);
    console.log(`Todos os contatos foram removidos.`);
    return true;
  } catch (error) {
    console.error('Erro ao limpar contatos:', error);
    return false;
  }
};

// Controladores para as rotas de usuários
exports.getAllUsers = (req, res) => {
  const userData = getUsers();
  
  // Se não houver usuários, tentar importar automaticamente
  if (userData.users.length === 0) {
    forceImportContacts();
    // Recarregar os usuários
    const newUserData = getUsers();
    return res.json(newUserData.users);
  }
  
  res.json(userData.users);
};

exports.getUserById = (req, res) => {
  const { id } = req.params;
  const userData = getUsers();
  const user = userData.users.find(user => user.id === id);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  res.json(user);
};

exports.getAllTags = (req, res) => {
  const userData = getUsers();
  
  // Extrair todas as tags únicas dos usuários
  const tagsFromUsers = userData.users.reduce((allTags, user) => {
    return [...allTags, ...user.tags];
  }, []);
  
  // Criar um conjunto único de tags
  const uniqueTags = [...new Set([...userData.tags, ...tagsFromUsers])];
  
  // Contar quantos usuários têm cada tag
  const tagsWithCount = uniqueTags.map(tag => {
    const count = userData.users.filter(user => user.tags.includes(tag)).length;
    return { id: tag, name: tag, count };
  });
  
  res.json(tagsWithCount);
};

exports.getUsersByTag = (req, res) => {
  const { tag } = req.params;
  const userData = getUsers();
  
  const filteredUsers = userData.users.filter(user => user.tags.includes(tag));
  
  res.json(filteredUsers);
};

exports.createUser = (req, res) => {
  const { name, email, phone, tags } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }
  
  const userData = getUsers();
  
  // Verificar se já existe um usuário com o mesmo email
  if (userData.users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'Já existe um usuário com este email' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    phone: phone || '',
    tags: tags || []
  };
  
  userData.users.push(newUser);
  
  // Adicionar novas tags à lista de tags global
  if (tags && tags.length) {
    const newTags = tags.filter(tag => !userData.tags.includes(tag));
    if (newTags.length) {
      userData.tags = [...userData.tags, ...newTags];
    }
  }
  
  if (saveUsers(userData)) {
    res.status(201).json(newUser);
  } else {
    res.status(500).json({ error: 'Erro ao salvar usuário' });
  }
};

exports.updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const userRequest = req.body;
    
    // Verificar se o usuário existe
    const userIndex = getUsers().users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Validações
    const errors = [];
    
    if (userRequest.name !== undefined && (!userRequest.name || !userRequest.name.trim())) {
      errors.push('Nome é obrigatório');
    }
    
    if (userRequest.email !== undefined && userRequest.email && !isValidEmail(userRequest.email)) {
      errors.push('Email inválido');
    }
    
    if (userRequest.phone !== undefined && userRequest.phone && !isValidPhone(userRequest.phone)) {
      errors.push('Telefone inválido. Formato esperado: 5511999887766');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    // Atualizar o usuário
    const existingUser = getUsers().users[userIndex];
    const updatedUser = {
      ...existingUser,
      name: userRequest.name !== undefined ? userRequest.name.trim() : existingUser.name,
      email: userRequest.email !== undefined ? (userRequest.email ? userRequest.email.trim() : '') : existingUser.email,
      phone: userRequest.phone !== undefined ? (userRequest.phone ? userRequest.phone.trim() : '') : existingUser.phone,
      tags: userRequest.tags !== undefined ? userRequest.tags : existingUser.tags
    };
    
    // Verificar se após a atualização o usuário tem pelo menos email ou telefone
    if (!updatedUser.email && !updatedUser.phone) {
      return res.status(400).json({ error: 'Email ou telefone é obrigatório' });
    }
    
    // Atualizar o usuário no array
    const userDataFile = getUsers();
    userDataFile.users[userIndex] = updatedUser;
    
    // Salvar as alterações no arquivo
    if (saveUsers(userDataFile)) {
      res.status(200).json(updatedUser);
    } else {
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userIndex = getUsers().users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Remover o usuário do array
    const userDataFile = getUsers();
    userDataFile.users.splice(userIndex, 1);
    
    // Salvar as alterações no arquivo
    if (saveUsers(userDataFile)) {
      res.status(200).json({ message: 'Usuário excluído com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
};

exports.addUser = async (req, res) => {
  try {
    const userRequest = req.body;
    console.log('Tentando adicionar usuário:', userRequest);
    
    // Validações
    const errors = [];
    
    if (!userRequest.name || !userRequest.name.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if ((!userRequest.email || !userRequest.email.trim()) && (!userRequest.phone || !userRequest.phone.trim())) {
      errors.push('Email ou telefone é obrigatório');
    }
    
    // Se houver erros, retorne eles
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Buscar usuários existentes
    const usersData = getUsers();
    
    // Verificar se já existe um usuário com o mesmo email
    if (userRequest.email && userRequest.email.trim()) {
      if (!isValidEmail(userRequest.email)) {
        return res.status(400).json({ errors: ['Email inválido'] });
      }
      
      const emailExists = usersData.users.some(user => user.email && user.email.toLowerCase() === userRequest.email.toLowerCase());
      if (emailExists) {
        return res.status(400).json({ errors: ['Email já cadastrado'] });
      }
    }
    
    // Verificar se já existe um usuário com o mesmo telefone
    if (userRequest.phone && userRequest.phone.trim()) {
      if (!isValidPhone(userRequest.phone)) {
        return res.status(400).json({ errors: ['Número de telefone inválido'] });
      }
      
      const phoneExists = usersData.users.some(user => user.phone && user.phone === userRequest.phone);
      if (phoneExists) {
        return res.status(400).json({ errors: ['Telefone já cadastrado'] });
      }
    }
    
    // Preparar o objeto de usuário para salvar
    const newUser = {
      id: Date.now().toString(),
      name: userRequest.name.trim(),
      email: userRequest.email ? userRequest.email.trim() : '',
      phone: userRequest.phone ? userRequest.phone.trim() : '',
      tags: userRequest.tags || []
    };
    
    // Adicionar o usuário à lista
    usersData.users.push(newUser);
    
    // Adicionar novas tags à lista de tags global
    if (userRequest.tags && userRequest.tags.length) {
      const newTags = userRequest.tags.filter(tag => !usersData.tags.includes(tag));
      if (newTags.length) {
        usersData.tags = [...usersData.tags, ...newTags];
      }
    }
    
    // Salvar os dados
    if (saveUsers(usersData)) {
      return res.status(201).json(newUser);
    } else {
      return res.status(500).json({ errors: ['Erro ao salvar usuário'] });
    }
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return res.status(500).json({ errors: ['Erro interno do servidor'] });
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    // Limpar o array de usuários
    const userData = getUsers();
    userData.users.length = 0;
    
    // Salvar as alterações no arquivo
    if (saveUsers(userData)) {
      res.status(200).json({ message: 'Todos os usuários foram excluídos com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao excluir todos os usuários' });
    }
  } catch (error) {
    console.error('Erro ao excluir todos os usuários:', error);
    res.status(500).json({ error: 'Erro ao excluir todos os usuários' });
  }
};

const filterUsersByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    
    if (!tags) {
      return res.status(400).json({ error: 'Tags não especificadas' });
    }
    
    const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
    
    const userData = getUsers();
    const filteredUsers = userData.users.filter(user => {
      return user.tags.some(tag => tagList.includes(tag.toLowerCase()));
    });
    
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Erro ao filtrar usuários por tags:', error);
    res.status(500).json({ error: 'Erro ao filtrar usuários por tags' });
  }
};

const getUsersWithEmail = async (req, res) => {
  try {
    const userData = getUsers();
    const usersWithEmail = userData.users.filter(user => user.email && user.email.trim() !== '');
    res.status(200).json(usersWithEmail);
  } catch (error) {
    console.error('Erro ao buscar usuários com email:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários com email' });
  }
};

const getUsersWithPhone = async (req, res) => {
  try {
    const userData = getUsers();
    const usersWithPhone = userData.users.filter(user => user.phone && user.phone.trim() !== '');
    res.status(200).json(usersWithPhone);
  } catch (error) {
    console.error('Erro ao buscar usuários com telefone:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários com telefone' });
  }
};

const importUsers = async (req, res) => {
  try {
    const { users: newUsers } = req.body;
    
    if (!Array.isArray(newUsers)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado um array de usuários.' });
    }
    
    const errors = [];
    const addedUsers = [];
    
    const userData = getUsers();
    
    for (const userData of newUsers) {
      // Validações básicas
      if (!userData.name || !userData.name.trim()) {
        errors.push(`Usuário sem nome: ${JSON.stringify(userData)}`);
        continue;
      }
      
      if ((!userData.email || !userData.email.trim()) && (!userData.phone || !userData.phone.trim())) {
        errors.push(`Usuário sem email e telefone: ${userData.name}`);
        continue;
      }
      
      // Criar novo usuário
      const newUser = {
        id: uuidv4(),
        name: userData.name.trim(),
        email: userData.email ? userData.email.trim() : '',
        phone: userData.phone ? userData.phone.trim() : '',
        tags: Array.isArray(userData.tags) ? userData.tags : [],
        createdAt: new Date().toISOString()
      };
      
      // Adicionar o usuário ao array
      userData.users.push(newUser);
      addedUsers.push(newUser);
    }
    
    // Salvar as alterações no arquivo
    if (saveUsers(userData)) {
      res.status(201).json({
        message: `${addedUsers.length} usuários importados com sucesso.`,
        errors: errors.length > 0 ? errors : undefined,
        users: addedUsers
      });
    } else {
      res.status(500).json({ error: 'Erro ao salvar usuários importados' });
    }
  } catch (error) {
    console.error('Erro ao importar usuários:', error);
    res.status(500).json({ error: 'Erro ao importar usuários' });
  }
};

// Funções auxiliares
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Validar formato esperado para WhatsApp: código do país + DDD + número
  // Ex: 5511999887766
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
}

exports.deleteAllUsers = deleteAllUsers;
exports.filterUsersByTags = filterUsersByTags;
exports.getUsersWithEmail = getUsersWithEmail;
exports.getUsersWithPhone = getUsersWithPhone;
exports.importUsers = importUsers;

// Função para forçar a reimportação de contatos
exports.reimportContacts = (req, res) => {
  if (forceImportContacts()) {
    const userData = getUsers();
    res.status(200).json({ 
      message: 'Todos os contatos foram removidos com sucesso', 
      count: userData.users.length,
      tags: userData.tags
    });
  } else {
    res.status(500).json({ error: 'Erro ao remover contatos' });
  }
};

// Exportar funções auxiliares para uso em outros controladores
exports.getUsersData = getUsers;
exports.saveUsersData = saveUsers; 