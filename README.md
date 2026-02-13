# 📧 Email Test App

> Aplicação web para testar envio de emails via SMTP de forma rápida e intuitiva

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4?logo=tailwindcss)
![Nodemailer](https://img.shields.io/badge/Nodemailer-8.0.1-339933?logo=nodemailer)

## 🚀 Visão Geral

O **Email Test App** é uma ferramenta web desenvolvida em **Next.js** e **TypeScript** que permite testar configurações de SMTP e envío de emails de forma simples e visual. Ideal para:

- ✅ Testar configurações SMTP antes de implementar em produção
- ✅ Validar credenciais de email
- ✅ Debug de problemas de entrega de emails
- ✅ Testar diferentes provedores SMTP (Gmail, Outlook, etc.)

## 🎯 Funcionalidades

### 📋 Interface Intuitiva
- **Formulário de configuração SMTP** com campos para host, porta, usuário, senha e remetente
- **Toggle para mostrar/ocultar senha** para maior segurança
- **Configuração de SSL/TLS** (secure) com dicas para portas comuns
- **Formulário de email** com destinatário, assunto e mensagem

### 🔧 Configuração Flexível
- **Credenciais dinâmicas**: Configure SMTP diretamente na interface
- **Suporte a variáveis de ambiente** para configurações persistentes
- **Validação em tempo real** dos campos obrigatórios
- **Feedback visual** do status de envio

### 🛡️ Segurança
- **Escape de HTML** para prevenir XSS na mensagem
- **Validação de campos** obrigatórios no backend
- **Tratamento de erros** robusto

## 📁 Estrutura do Projeto

```
email-test/
├── 📄 README.md
├── 📦 package.json
├── ⚙️ next.config.ts
├── 🎨 tailwind.config.js
├── 🔧 tsconfig.json
│
├── 📂 app/
│   ├── 🎨 globals.css           # Estilos globais
│   ├── 📄 layout.tsx            # Layout principal
│   ├── 🏠 page.tsx              # Página inicial com formulário
│   │
│   └── 📂 api/
│       └── 📂 send-email/
│           └── 🔚 route.ts      # API para envio de email
│
├── 📂 lib/
│   └── 📧 mail.ts               # Utilitário para envio (alternativo - fora de uso)
│
└── 📂 public/                   # Arquivos estáticos
```

## 🏗️ Como Funciona

### 1. 🎨 Frontend (React/Next.js)
- **Interface responsiva** construída com Tailwind CSS
- **Estado gerenciado** com React Hooks (useState, useMemo)
- **Validação em tempo real** das credenciais SMTP
- **Feedback visual** durante o processo de envio

### 2. 🔗 API Route (Next.js API)
- **Endpoint `/api/send-email`** que recebe dados via POST
- **Configuração dinâmica** do transporter Nodemailer
- **Tratamento de erros** e status HTTP apropriados

### 3. 📧 Nodemailer
- **Transporter configurável** com diferentes provedores SMTP
- **Suporte a SSL/TLS** conforme a porta configurada
- **Escape automático de HTML** na mensagem

## 🛠️ Instalação e Uso

### Pré-requisitos
- Node.js 18+
- npm/yarn/pnpm

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd email-test
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure variáveis de ambiente (opcional - se for usar é necessário descomentar em page.tsx e route.ts)
Crie um arquivo `.env.local`:

```bash
# Configuração SMTP padrão
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM="Seu Nome <seu-email@gmail.com>"
```

### 4. Execute o projeto
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

### 5. Acesse a aplicação
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🎮 Como Usar

### 1. 🔑 Configure as Credenciais SMTP
- Preencha o **host SMTP** (ex: `smtp.gmail.com`)
- Defina a **porta** (587 para STARTTLS, 465 para SSL)
- Insira seu **email** e **senha de aplicativo**
- Configure o campo **From** (remetente)
- Marque **Secure** apenas para porta 465

### 2. 📝 Preencha o Email
- **Destinatário**: Email para onde será enviada a mensagem
- **Assunto**: Título do email
- **Mensagem**: Conteúdo do email (suporte a quebras de linha)

### 3. 🚀 Envie o Email
- Clique em **Enviar** e aguarde o feedback
- ✅ **Sucesso**: Email enviado com sucesso
- ❌ **Erro**: Detalhes do erro serão exibidos

## 📧 Configurações SMTP Comuns

### Gmail
```
Host: smtp.gmail.com
Porta: 587
Secure: false (STARTTLS)
Usuário: seu-email@gmail.com
Senha: senha-de-aplicativo-gerada
```

### Outlook/Hotmail
```
Host: smtp-mail.outlook.com
Porta: 587
Secure: false (STARTTLS)
Usuário: seu-email@outlook.com
Senha: sua-senha
```

### Yahoo
```
Host: smtp.mail.yahoo.com
Porta: 587 ou 465
Secure: false (587) ou true (465)
Usuário: seu-email@yahoo.com
Senha: senha-de-aplicativo
```

## ⚠️ Dicas Importantes

### 🔐 Para Gmail
1. Ative a **autenticação em duas etapas**
2. Gere uma **senha de aplicativo** nas configurações da conta
3. Use a **senha de aplicativo** no lugar da senha normal

### 🛡️ Segurança
- **Nunca** commite credenciais no código
- Use **variáveis de ambiente** para configurações sensíveis
- Considere usar **OAuth2** para produção

### 🐛 Solução de Problemas
- **Erro 535**: Credenciais incorretas
- **Erro 534**: Precisa ativar acesso a apps menos seguros
- **Timeout**: Verifique host/porta e firewall

## 📚 Tecnologias Utilizadas

- **[Next.js 16.1.6](https://nextjs.org/)** - Framework React para aplicações full-stack
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript com tipagem estática
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Nodemailer 8.0.1](https://nodemailer.com/)** - Biblioteca para envio de emails
- **[React 19.2.3](https://react.dev/)** - Biblioteca para interfaces de usuário

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvido por

Desenvolvido com ❤️ e ☕ por [seu-nome](https://github.com/seu-usuario)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!
