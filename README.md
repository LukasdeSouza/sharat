# Form Workflow Builder - SaaS Multi-Tenant

Um sistema completo para criar forms e workflows com autenticação, autorização e isolamento de dados por empresa.

## 🎯 Visão Geral

**Form Workflow Builder** é uma plataforma SaaS que permite:

- ✅ Criar empresas e gerenciar usuários
- ✅ Construir forms com drag-and-drop
- ✅ Definir workflows para processar submissions
- ✅ Gerenciar submissions e approvals
- ✅ Controle de acesso baseado em roles
- ✅ Isolamento de dados por empresa

## 🏗️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- TailwindCSS (Notion-inspired design)
- React Router
- React DnD (drag-and-drop)
- Vite

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcryptjs (password hashing)

## 📁 Estrutura do Projeto

```
shakrat/
├── backend/                          # Node.js + Express API
│   ├── server.js                    # Servidor principal
│   ├── middleware/auth.js           # JWT authentication
│   ├── routes/
│   │   ├── auth.js                 # Register, login
│   │   ├── forms.js                # CRUD forms
│   │   ├── workflows.js            # CRUD workflows
│   │   └── submissions.js          # CRUD submissions
│   ├── scripts/migrate.js           # Database setup
│   ├── package.json
│   └── README.md
│
├── form-workflow-builder/            # React + TypeScript Frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── ARCHITECTURE.md                   # Arquitetura detalhada
├── INTEGRATION_GUIDE.md              # Como integrar frontend + backend
├── DEPLOYMENT_GUIDE.md               # Como fazer deploy
├── QUICK_START.md                    # Quick start
├── SYSTEM_OVERVIEW.md                # Visão geral do sistema
├── BACKEND_SUMMARY.md                # Resumo do backend
└── IMPLEMENTATION_CHECKLIST.md       # Checklist de implementação
```

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run migrate
npm run dev
```

Backend rodando em `http://localhost:3001`

### 2. Frontend

```bash
cd form-workflow-builder
npm install
npm run dev
```

Frontend rodando em `http://localhost:5173`

### 3. Testar

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "email": "test@example.com",
    "password": "password123"
  }'

# Copiar token e usar em requisições
```

## 🔐 Autenticação

### Register (Criar Empresa)

```bash
POST /api/auth/register
{
  "company_name": "Minha Empresa",
  "email": "user@empresa.com",
  "password": "senha123"
}
```

### Login

```bash
POST /api/auth/login
{
  "email": "user@empresa.com",
  "password": "senha123"
}
```

### Usar Token

```bash
GET /api/forms
Authorization: Bearer {token}
```

## 📊 Roles e Permissões

| Ação | Admin | Editor | Viewer | Approver |
|------|-------|--------|--------|----------|
| Criar Form | ✓ | ✓ | ✗ | ✗ |
| Editar Form | ✓ | ✓ | ✗ | ✗ |
| Deletar Form | ✓ | ✗ | ✗ | ✗ |
| Ver Submissions | ✓ | ✓ | ✓ | ✓ |
| Aprovar Workflow | ✓ | ✗ | ✗ | ✓ |

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Criar empresa
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Usuário atual

### Forms
- `GET /api/forms` - Listar
- `GET /api/forms/{id}` - Obter
- `POST /api/forms` - Criar
- `PUT /api/forms/{id}` - Atualizar
- `DELETE /api/forms/{id}` - Deletar

### Workflows
- `GET /api/workflows/form/{formId}` - Listar
- `GET /api/workflows/{id}` - Obter
- `POST /api/workflows` - Criar
- `PUT /api/workflows/{id}` - Atualizar
- `DELETE /api/workflows/{id}` - Deletar

### Submissions
- `GET /api/submissions/form/{formId}` - Listar
- `GET /api/submissions/{id}` - Obter
- `POST /api/submissions` - Criar
- `PUT /api/submissions/{id}/status` - Atualizar status
- `DELETE /api/submissions/{id}` - Deletar

## 🗄️ Database Schema

```sql
companies          -- Tenants (empresas)
users              -- Usuários com roles
forms              -- Schemas de forms
workflows          -- Definições de workflows
submissions        -- Respostas de forms
workflow_executions -- Rastreamento de execução
```

## 🎨 Design System

- **Cores**: Black, White, Gray (Notion-inspired)
- **Componentes**: Buttons, Forms, Cards, Tables, Modals, Toasts
- **Responsivo**: Desktop, Tablet, Mobile

## 📚 Documentação

- `QUICK_START.md` - Começar em 5 minutos
- `ARCHITECTURE.md` - Arquitetura completa
- `INTEGRATION_GUIDE.md` - Integrar frontend + backend
- `DEPLOYMENT_GUIDE.md` - Fazer deploy
- `SYSTEM_OVERVIEW.md` - Visão geral do sistema
- `BACKEND_SUMMARY.md` - Resumo do backend
- `IMPLEMENTATION_CHECKLIST.md` - Checklist de implementação

## 🔒 Segurança

✓ Senhas hasheadas com bcryptjs
✓ JWT tokens com expiração
✓ Multi-tenant isolation
✓ Role-based access control
✓ Validação de input
✓ Filtro por company_id em todas as queries

## 📈 Escalabilidade

✓ Índices de performance
✓ Paginação em submissions
✓ Isolamento por company
✓ Pronto para load balancing
✓ Pronto para cache (Redis)
✓ Pronto para message queue

## 🚀 Deploy

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway)
```bash
railway up
```

### Database (Neon)
```bash
# Criar em neon.tech
# Copiar DATABASE_URL
```

## 🐛 Troubleshooting

### Backend não conecta ao database
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
psql $DATABASE_URL -c "SELECT 1"

# Executar migrations
npm run migrate
```

### Frontend não conecta ao backend
```bash
# Verificar REACT_APP_API_URL
echo $REACT_APP_API_URL

# Verificar CORS no backend
# Verificar se backend está rodando
curl http://localhost:3001/health
```

## 📞 Suporte

Para dúvidas:
1. Verificar documentação
2. Verificar logs
3. Ler ARCHITECTURE.md
4. Ler QUICK_START.md

## 📝 Próximos Passos

1. **Integração Frontend + Backend**
   - Substituir localStorage por API
   - Implementar auth service
   - Atualizar componentes

2. **Melhorias de Segurança**
   - Refresh tokens
   - Rate limiting
   - Data encryption

3. **Funcionalidades**
   - Email notifications
   - Audit logging
   - Webhooks

4. **DevOps**
   - Docker
   - CI/CD
   - Monitoring

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ para demonstrar uma arquitetura SaaS moderna e escalável.

---

**Status**: 60% Completo
- ✅ Backend: 100%
- ✅ Frontend: 100%
- 🔄 Integração: 0%
- 🔄 Testes: 0%
- 🔄 Deploy: 0%

**Comece agora**: Leia `QUICK_START.md`
