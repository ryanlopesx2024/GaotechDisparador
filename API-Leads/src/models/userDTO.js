const { v4: uuidv4 } = require('uuid');

class UserDTO {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  validate() {
    const errors = [];

    if (!this.name.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!this.email && !this.phone) {
      errors.push('Email ou telefone é obrigatório');
    }

    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Email inválido');
    }

    if (this.phone && !this.isValidPhone(this.phone)) {
      errors.push('Telefone inválido. Formato esperado: 5511999887766');
    }

    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    // Validar formato esperado para WhatsApp: código do país + DDD + número
    // Ex: 5511999887766
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  }
}

module.exports = UserDTO; 