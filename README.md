# 📘 EduConnect — Sistema de Gestão Escolar Fullstack

O **EduConnect** é uma plataforma robusta de gestão escolar projetada para modernizar a comunicação e administração pedagógica. O sistema utiliza uma arquitetura desacoplada com um Back-end escalável em .NET e um Front-end dinâmico em React.

---

## 🛠️ Tecnologias e Stacks

### **Back-end**
- **Runtime:** .NET 8 (C#)
- **Arquitetura:** Clean Architecture (Domain, Application, Infrastructure, API)
- **ORM:** Entity Framework Core
- **Banco de Dados:** SQL Server (ou PostgreSQL/SQLite conforme configuração)
- **Comunicação Real-time:** SignalR (WebSockets) para chat
- **Relatórios:** QuestPDF
- **E-mail:** MailKit/MimeKit com integração Ethereal Email (SMTP)

### **Front-end**
- **Framework:** React + Vite (TypeScript)
- **Estilização:** Tailwind CSS + Lucide React (Icons)
- **Gerenciamento de Estado:** Zustand (Global) & React Query (Server-state)
- **Gráficos:** Recharts

---

## 🏗️ Arquitetura e Diferenciais Técnicos

- **Padrão Decoupled:** Separação total entre Front-end (SPA) e Back-end (RESTful API).
- **TPH (Table Per Hierarchy):** Implementação de herança no banco de dados para otimização de entidades de Usuário.
- **Soft Delete:** Exclusão lógica para preservação de integridade de dados e histórico.
- **RBAC (Role-Based Access Control):** Controle de visibilidade de dados sensíveis (ex: Ranking de Alunos limitado para usuários comuns e completo para gestores).
- **Fluxo Financeiro:** Simulação de pagamentos via PIX com integração de Webhooks e atualização em tempo real.

---

# 🚀 Como Executar o Projeto

## **Pré-requisitos**
- .NET 8 SDK
- Node.js (v18+) & Yarn ou NPM
- SQL Server LocalDB ou Instância Docker

---

## **1. Configurando o Back-end**

```bash
# Clone o repositório
git clone https://github.com/CrMessiProgrammer/EduConnect.git

# Acesse a pasta do servidor
cd EduConnect/EduConnect.API

# Restaure as dependências
dotnet restore

# Atualize o banco de dados (Migrations)
dotnet ef database update

# Execute o projeto
dotnet run
```

---

## **2. Configurando o Front-end**

```bash
# Acesse a pasta do cliente
cd ../EduConnect.Web

# Instale as dependências
yarn install
# ou
npm install

# Execute em modo de desenvolvimento
yarn dev
# ou
npm run dev
```

---

# 🗄️ Guia de Banco de Dados (Entity Framework)

Este projeto utiliza EF Core Migrations. Seguem os comandos principais:

## **Criar uma nova Migration**
Use este comando sempre que alterar uma Entidade no Domain.

```bash
dotnet ef migrations add NomeDaMudanca --project ../EduConnect.Infrastructure --startup-project .
```

---

## **Atualizar o Banco de Dados**
Aplica as mudanças pendentes ao SQL Server.

```bash
dotnet ef database update
```

---

## **Remover última Migration**
(Caso ainda não tenha dado update no banco)

```bash
dotnet ef migrations remove
```

---

# 🧪 Testes Automatizados

O sistema conta com suites de testes unitários para garantir a qualidade das regras de negócio.

## **Back-end (xUnit)**

```bash
dotnet test
```

## **Front-end (Vitest)**

```bash
yarn test
# ou
npm run test
```

---

# 📄 Funcionalidades Principais

- [x] Dashboard Administrativo: Indicadores financeiros e pedagógicos em tempo real.
- [x] Gestão de Alunos em Risco: Alertas automáticos baseados em frequência e notas.
- [x] Loja de Uniformes: Checkout completo com geração de PIX Copia e Cola.
- [x] Financeiro: Extrato consolidado e simulação de conciliação bancária via Webhook.
- [x] Ranking Gamificado: Top 5 visível para alunos/pais para incentivo ao desempenho.
- [x] Chat Real-time: Comunicação direta entre responsáveis e coordenação.

---

# 👨‍💻 Autor

Carlos Henrique Nunes  
Trainee Digital - TIVIT

---
