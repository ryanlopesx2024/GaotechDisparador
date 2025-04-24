# Sistema de Envio de Mensagens Automatizadas

![Logo do Projeto](https://via.placeholder.com/150x150.png?text=Disparo+Gao)

## 📋 Sobre o Projeto

Este sistema é uma plataforma completa para gerenciamento e envio de mensagens em massa por WhatsApp e e-mail. Desenvolvido para facilitar a comunicação com clientes e leads, o sistema permite enviar mensagens personalizadas, gerenciar contatos, acompanhar métricas de envio e criar campanhas direcionadas por tags.

## 🚀 Principais Funcionalidades

### 📱 Mensagens WhatsApp
- Envio individual de mensagens de texto
- Envio individual de mídia (imagens, vídeos, documentos)
- Envio em massa para grupos de contatos filtrados por tags
- Interface para acompanhamento dos resultados de envio

### 📧 E-mails
- Envio individual de e-mails
- Envio em massa para contatos filtrados por tags
- Suporte a templates e formatação
- Múltiplos provedores de e-mail (Gmail, Outlook, Webmail)

### 👥 Gerenciamento de Usuários
- Cadastro de usuários/contatos
- Importação automática de contatos do arquivo `lista_contatos.json`
- Categorização por tags (estado, setor, ERP, etc.)
- Busca e filtragem avançada

### 📊 Dashboard e Métricas
- Visualização de estatísticas de envio
- Gráficos de desempenho diário
- Taxas de sucesso/falha
- Acompanhamento em tempo real

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js** - Framework React para renderização
- **React** - Biblioteca para construção de interfaces
- **Tailwind CSS** - Framework CSS para estilização
- **Shadcn/UI** - Componentes de UI reutilizáveis
- **Recharts** - Biblioteca para criação de gráficos

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para criação de APIs
- **Nodemailer** - Biblioteca para envio de e-mails
- **Axios** - Cliente HTTP para requisições externas

### APIs Externas
- **Evolution API** - API para integração com WhatsApp

## 🗂️ Estrutura do Projeto

```
disparo-gao/
├── app/                  # Páginas principais do Next.js
│   ├── emails/           # Página de envio de e-mails
│   ├── mensagens/        # Página de envio de mensagens WhatsApp
│   ├── usuarios/         # Página de gerenciamento de usuários
│   └── layout.tsx        # Layout principal da aplicação
├── components/           # Componentes React reutilizáveis
│   ├── dashboard/        # Componentes do painel
│   ├── email/            # Componentes relacionados a e-mail
│   ├── ui/               # Componentes de interface de usuário
│   └── usuarios/         # Componentes de usuários
├── API-Leads/            # Servidor backend
│   ├── data/             # Armazenamento de dados
│   ├── src/              # Código-fonte do backend
│   │   ├── controllers/  # Controladores da aplicação
│   │   ├── models/       # Modelos de dados
│   │   ├── routes/       # Rotas da API
│   │   └── server.js     # Ponto de entrada do servidor
│   └── .env              # Variáveis de ambiente
└── next.config.mjs       # Configuração do Next.js
```

## 🚦 Como Executar o Projeto

### Pré-requisitos
- Node.js 18.x ou superior
- NPM ou Yarn
- Conta na Evolution API para integração com WhatsApp

### Configuração
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/GaotechDisparador.git
cd GaotechDisparador
```

2. Instale as dependências do frontend:
```bash
npm install
```

3. Instale as dependências do backend:
```bash
cd API-Leads
npm install
```

4. Configure as variáveis de ambiente:
   - Crie ou edite o arquivo `.env` na pasta `API-Leads` com suas configurações:

```
NODE_ENV=development
PORT=3003

# Email Configuration
EMAIL_USER=seu-email@exemplo.com
EMAIL_PASS=sua-senha-de-app
EMAIL_HOST=smtp.exemplo.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Evolution API Configuration
EVOLUTION_API_URL=https://sua-instancia-evolution.com
EVOLUTION_INSTANCE_NAME=nome-da-instancia
EVOLUTION_KEY=sua-api-key
EVOLUTION_INSTANCE_KEY=sua-instance-key
EVOLUTION_NUMBER=5511999887766
```

### Execução

1. Inicie o servidor backend (porta 3003):
```bash
cd API-Leads
npm run dev
# ou para evitar reinicialização automática:
node src/server.js
```

2. Inicie o frontend (porta 3000):
```bash
# Na pasta raiz do projeto
npm run dev
```

3. Acesse a aplicação em seu navegador: http://localhost:3000

## 📬 Envio em Massa

### Por WhatsApp
1. Acesse a página "Mensagens"
2. Clique na aba "Envio em Massa"
3. Selecione as tags para filtrar os usuários
4. Digite sua mensagem
5. Clique em "Enviar Mensagens em Massa"

> **Endpoint utilizado:**
> - POST `/api/bulk/whatsapp/users` para envio em massa
> - POST `/api/evo/sendMessage` para envio individual

### Por E-mail
1. Acesse a página "Emails"
2. Selecione os usuários ou tags
3. Preencha assunto e conteúdo do e-mail
4. Clique em "Enviar E-mails" (individual) ou "Enviar E-mails em Massa"

> **Endpoint utilizado:**
> - POST `/api/mail/sendEmail` para envio individual
> - POST `/api/bulk/email/users` para envio em massa

**Importante:**
- Todos os envios devem ser feitos usando método POST.
- As URLs dos endpoints são relativas à variável de ambiente `NEXT_PUBLIC_API_URL` no frontend, que deve apontar para seu backend Railway.
- Exemplo de configuração:
  ```env
  NEXT_PUBLIC_API_URL=https://prolific-fulfillment-production.up.railway.app/api
  ```
- O backend não aceita requisições GET para esses endpoints.

## 🔑 Integrações

### Evolution API (WhatsApp)
O sistema se integra com a Evolution API para o envio de mensagens do WhatsApp. Para configurar:

1. Obtenha suas credenciais na Evolution API
2. Configure-as no arquivo `.env`
3. Certifique-se de que a instância está ativa e pareada com um número de WhatsApp

### Provedores de E-mail
O sistema suporta diversos provedores de e-mail:

- **Gmail**: Configure com credenciais de app do Google
- **Outlook**: Configure com credenciais da Microsoft
- **Webmail**: Configure com SMTP personalizado

## 📝 Notas Importantes

- O armazenamento de dados é feito em arquivos JSON, em um ambiente de produção considere usar um banco de dados
- As métricas são armazenadas em memória e serão reiniciadas se o servidor for reiniciado
- Para o envio em massa, respeite as limitações das APIs do WhatsApp para evitar bloqueios

## 🛡️ Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 👥 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests para melhorar o sistema.

---

Desenvolvido por [GAO Tech](https://gaotech.com.br) © 2024 
