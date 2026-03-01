# Backend - Resumo Executivo

## O que foi criado

Um backend completo em Node.js + Express com PostgreSQL para suportar o Form Workflow Builder como um SaaS multi-tenant.

## Arquivos Criados

```
backend/
├── server.js                 # Servidor Express principal
├── package.json              # Dependências
├── .env.example              # Variáveis de ambiente (exemplo)
├── .gitignore                # Arquivos a ignorar
├── README.md                 # Documentação
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/
│   ├── auth.js              # Register, login, getCurrentUser
│   ├── forms.js             # CRUD de forms
│   ├── workflows.js         # CRUD de workflows
│   └── submissions.js       # CRUD de submissions
└── scripts/
    └── migrate.js           # Criar tabelas no banco
```

## Características Principais

### 1. Multi-Tenant com Company Isolation
- Cada empresa tem seus próprios dados
- Usuários só veem dados da sua empresa
- Isolamento garantido por `company_id` em todas as queries

### 2. Autenticação JWT
- Register: Criar empresa + usuário
- Login: Autenticar com email/senha
- Token expira em 7 dias
- Senhas hasheadas com bcryptjs

### 3. Role-Based Access Control (RBAC)
- **admin**: Criar/editar/deletar tudo
- **editor**: Criar/editar forms e workflows
- **viewer**: Apenas visualizar
- **approver**: Aprovar/rejeitar workflows

### 4. Endpoints da API

#### Autenticação
- `POST /api/auth/register` - Criar empresa e usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual

#### Forms
- `GET /api/forms` - Listar forms
- `GET /api/forms/{id}` - Obter form
- `POST /api/forms` - Criar form
- `PUT /api/forms/{id}` - Atualizar form
- `DELETE /api/forms/{id}` - Deletar form

#### Workflows
- `GET /api/workflows/form/{formId}` - Listar workflows de um form
- `GET /api/workflows/{id}` - Obter workflow
- `POST /api/workflows` - Criar workflow
- `PUT /api/workflows/{id}` - Atualizar workflow
- `DELETE /api/workflows/{id}` - Deletar workflow

#### Submissions
- `GET /api/submissions/form/{formId}` - Listar submissions
- `GET /api/submissions/{id}` - Obter submission
- `POST /api/submissions` - Criar submission
- `PUT /api/submissions/{id}/status` - Atualizar status
- `DELETE /api/submissions/{id}` - Deletar submission

## Como Usar

### 1. Setup Inicial

```bash
cd backend
npm install
npm run migrate
npm run dev
```

### 2. Registrar Empresa

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Minha Empresa",
    "email": "user@empresa.com",
    "password": "senha123"
  }'
```

Response:
```json
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

### 3. Usar Token em Requisições

```bash
curl -X GET http://localhost:3001/api/forms \
  -H "Authorization: Bearer {token}"
```

## Banco de Dados

### Tabelas Criadas

1. **companies** - Tenants (empresas)
2. **users** - Usuários com roles
3. **forms** - Schemas de forms
4. **workflows** - Definições de workflows
5. **submissions** - Respostas de forms
6. **workflow_executions** - Rastreamento de execução

### Índices para Performance

- `idx_users_company_id` - Queries rápidas por empresa
- `idx_forms_company_id` - Queries rápidas de forms
- `idx_submissions_company_id` - Queries rápidas de submissions
- E mais 7 índices para otimizar queries

## Segurança

✓ Senhas hasheadas com bcryptjs (10 rounds)
✓ JWT tokens com expiração
✓ Multi-tenant isolation
✓ Role-based access control
✓ Validação de input
✓ Filtro por company_id em todas as queries

## Escalabilidade

✓ Índices de performance
✓ Paginação em submissions
✓ Isolamento por company
✓ Pronto para load balancing
✓ Pronto para cache (Redis)
✓ Pronto para message queue

## Próximos Passos

1. **Integrar Frontend**
   - Substituir localStorage por API
   - Implementar auth service
   - Atualizar componentes

2. **Melhorias de Segurança**
   - Refresh tokens
   - Rate limiting
   - CORS configurado

3. **Funcionalidades**
   - Email notifications
   - Audit logging
   - Data encryption

4. **DevOps**
   - Docker
   - CI/CD
   - Monitoring

## Variáveis de Ambiente

```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=seu-secret-key
PORT=3001
NODE_ENV=development
```

## Dependências

```json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.1.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "uuid": "^9.0.1"
}
```

## Documentação Completa

- `README.md` - Instruções de setup e API docs
- `ARCHITECTURE.md` - Arquitetura detalhada
- `INTEGRATION_GUIDE.md` - Como integrar com frontend

## Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Verificar DATABASE_URL
3. Verificar JWT_SECRET
4. Executar migrations novamente
