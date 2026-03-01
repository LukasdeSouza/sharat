# Quick Start - Form Workflow Builder

## 🚀 Começar em 5 minutos

### 1. Setup Backend

```bash
cd backend
npm install
npm run migrate
npm run dev
```

✓ Backend rodando em `http://localhost:3001`

### 2. Setup Frontend

```bash
cd form-workflow-builder
npm install
npm run dev
```

✓ Frontend rodando em `http://localhost:5173`

### 3. Testar API

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "email": "test@example.com",
    "password": "password123"
  }'

# Copiar o token da resposta

# Listar forms
curl -X GET http://localhost:3001/api/forms \
  -H "Authorization: Bearer {token}"
```

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
│   └── package.json
│
├── form-workflow-builder/            # React + TypeScript Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Dashboard
│   │   │   ├── FormBuilder.tsx     # Form editor
│   │   │   ├── WorkflowDesigner.tsx # Workflow editor
│   │   │   ├── FormPreview.tsx     # Form preview
│   │   │   └── Submissions.tsx     # Submissions list
│   │   ├── components/
│   │   │   ├── Layout.tsx          # Main layout
│   │   │   ├── Toast.tsx           # Notifications
│   │   │   ├── Dialog.tsx          # Confirmations
│   │   │   └── Loading.tsx         # Loading states
│   │   ├── services/
│   │   │   ├── LocalStorageService.ts
│   │   │   └── ValidationService.ts
│   │   └── types/index.ts          # TypeScript types
│   └── package.json
│
├── ARCHITECTURE.md                   # Arquitetura detalhada
├── INTEGRATION_GUIDE.md              # Como integrar frontend + backend
├── DEPLOYMENT_GUIDE.md               # Como fazer deploy
└── BACKEND_SUMMARY.md                # Resumo do backend
```

## 🔐 Autenticação

### Register (Criar Empresa)

```typescript
POST /api/auth/register
{
  "company_name": "Minha Empresa",
  "email": "user@empresa.com",
  "password": "senha123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@empresa.com",
    "company_id": "uuid",
    "role": "admin"
  }
}
```

### Login

```typescript
POST /api/auth/login
{
  "email": "user@empresa.com",
  "password": "senha123"
}
```

### Usar Token

```typescript
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

## 🗄️ Database Schema

```sql
companies
├── id (UUID)
├── name
└── created_at

users
├── id (UUID)
├── company_id (FK)
├── email
├── password_hash
├── role (admin, editor, viewer, approver)
└── created_at

forms
├── id (UUID)
├── company_id (FK)
├── created_by (FK)
├── name
├── schema (JSONB)
├── is_published
└── created_at

workflows
├── id (UUID)
├── form_id (FK)
├── company_id (FK)
├── name
├── definition (JSONB)
└── created_at

submissions
├── id (UUID)
├── form_id (FK)
├── company_id (FK)
├── data (JSONB)
├── workflow_status
└── submitted_at
```

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

## 🎨 Design System

### Cores (Notion-inspired)
- **Primary**: Black (#000000)
- **Background**: White (#ffffff)
- **Border**: Light Gray (#e5e5e5)
- **Text**: Dark Gray (#626262)

### Componentes
- Buttons
- Forms
- Cards
- Tables
- Modals
- Toasts
- Loading states

## 📝 Fluxo de Uso

### 1. Criar Empresa
```
User → Register → Backend cria company + user → Token
```

### 2. Criar Form
```
User → Form Builder → Drag-and-drop → Save → API
```

### 3. Criar Workflow
```
User → Workflow Designer → Add steps → Connect → Save → API
```

### 4. Submeter Form
```
User → Form Preview → Fill → Submit → API → Submissions
```

### 5. Aprovar Workflow
```
Approver → Submissions → Review → Approve/Reject → API
```

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

## 📚 Documentação

- `ARCHITECTURE.md` - Arquitetura completa
- `INTEGRATION_GUIDE.md` - Integração frontend + backend
- `DEPLOYMENT_GUIDE.md` - Como fazer deploy
- `backend/README.md` - API documentation

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

### Token expirado
```bash
# Fazer login novamente
# Token expira em 7 dias
```

## 📞 Suporte

Para dúvidas:
1. Verificar logs: `npm run dev` (frontend/backend)
2. Verificar database: `psql $DATABASE_URL`
3. Verificar API: `curl http://localhost:3001/health`
4. Ler documentação: `ARCHITECTURE.md`

## ✅ Checklist

- [ ] Backend rodando
- [ ] Database conectado
- [ ] Frontend rodando
- [ ] Conseguir fazer register
- [ ] Conseguir fazer login
- [ ] Conseguir criar form
- [ ] Conseguir submeter form
- [ ] Conseguir ver submissions

## 🎯 Próximos Passos

1. Integrar frontend com API (substituir localStorage)
2. Implementar email notifications
3. Adicionar audit logging
4. Fazer deploy em produção
5. Configurar CI/CD

---

**Pronto para começar? Execute:**

```bash
# Terminal 1: Backend
cd backend && npm install && npm run migrate && npm run dev

# Terminal 2: Frontend
cd form-workflow-builder && npm install && npm run dev

# Terminal 3: Testar
curl http://localhost:3001/health
```

Acesse `http://localhost:5173` no navegador! 🎉
