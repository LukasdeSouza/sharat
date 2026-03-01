# Form Workflow Builder - Backend

Backend API para o Form Workflow Builder com suporte a multi-tenant, autenticação JWT e controle de acesso baseado em roles.

## Arquitetura

### Multi-Tenant com Company Isolation

```
Companies (Tenants)
├── Users (com roles: admin, editor, viewer, approver)
├── Forms (isoladas por company)
├── Workflows (isoladas por company)
├── Submissions (isoladas por company)
└── Workflow Executions
```

### Roles e Permissões

- **admin**: Criar/editar/deletar forms, workflows, gerenciar usuários
- **editor**: Criar/editar forms e workflows
- **viewer**: Apenas visualizar forms e submissions
- **approver**: Aprovar/rejeitar workflows

## Setup

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Editar .env com suas credenciais do PostgreSQL
```

### 3. Executar migrations

```bash
npm run migrate
```

Isso criará todas as tabelas, índices e relacionamentos no banco de dados.

### 4. Iniciar o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3001`

## API Endpoints

### Autenticação

#### Register (Criar empresa e usuário)
```
POST /api/auth/register
Content-Type: application/json

{
  "company_name": "Minha Empresa",
  "email": "user@empresa.com",
  "password": "senha123"
}

Response:
{
  "message": "Company and user created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@empresa.com",
    "company_id": "uuid",
    "role": "admin"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@empresa.com",
  "password": "senha123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@empresa.com",
    "company_id": "uuid",
    "role": "admin"
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@empresa.com",
    "company_id": "uuid",
    "role": "admin"
  }
}
```

### Forms

#### List Forms
```
GET /api/forms
Authorization: Bearer {token}

Response: [
  {
    "id": "uuid",
    "company_id": "uuid",
    "created_by": "uuid",
    "name": "Contact Form",
    "description": "...",
    "schema": {...},
    "is_published": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Form
```
GET /api/forms/{id}
Authorization: Bearer {token}
```

#### Create Form
```
POST /api/forms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Contact Form",
  "description": "A simple contact form",
  "schema": {
    "fields": [...]
  }
}
```

#### Update Form
```
PUT /api/forms/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "schema": {...},
  "is_published": true
}
```

#### Delete Form
```
DELETE /api/forms/{id}
Authorization: Bearer {token}
```

### Workflows

#### Get Workflows for Form
```
GET /api/workflows/form/{formId}
Authorization: Bearer {token}
```

#### Get Workflow
```
GET /api/workflows/{id}
Authorization: Bearer {token}
```

#### Create Workflow
```
POST /api/workflows
Authorization: Bearer {token}
Content-Type: application/json

{
  "form_id": "uuid",
  "name": "Approval Workflow",
  "definition": {
    "steps": [...]
  }
}
```

#### Update Workflow
```
PUT /api/workflows/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "definition": {...}
}
```

#### Delete Workflow
```
DELETE /api/workflows/{id}
Authorization: Bearer {token}
```

### Submissions

#### Get Submissions for Form
```
GET /api/submissions/form/{formId}?limit=50&offset=0
Authorization: Bearer {token}

Response:
{
  "data": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### Get Submission
```
GET /api/submissions/{id}
Authorization: Bearer {token}
```

#### Create Submission
```
POST /api/submissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "form_id": "uuid",
  "data": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

#### Update Submission Status
```
PUT /api/submissions/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "workflow_status": "approved"
}
```

#### Delete Submission
```
DELETE /api/submissions/{id}
Authorization: Bearer {token}
```

## Segurança

### Multi-Tenant Isolation

Todos os endpoints verificam `company_id` do usuário autenticado:

```javascript
// Exemplo: Usuário só vê forms da sua empresa
SELECT * FROM forms WHERE company_id = $1
```

### Role-Based Access Control

```javascript
// Exemplo: Apenas admins podem deletar
if (role !== 'admin') {
  return res.status(403).json({ error: 'Only admins can delete' });
}
```

### JWT Authentication

- Token expira em 7 dias
- Incluir no header: `Authorization: Bearer {token}`
- Verificado em todos os endpoints protegidos

## Escalabilidade

### Índices de Performance

```sql
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_forms_company_id ON forms(company_id);
CREATE INDEX idx_submissions_company_id ON submissions(company_id);
-- ... mais índices
```

### Paginação

```
GET /api/submissions/form/{formId}?limit=50&offset=0
```

### Isolamento por Company

Cada query filtra por `company_id`, garantindo:
- Dados isolados
- Queries rápidas
- Segurança

## Próximos Passos

1. **Integrar com Frontend**: Atualizar localStorage service para usar API
2. **Notificações**: Implementar email notifications para approvals
3. **Audit Logging**: Registrar todas as ações
4. **Rate Limiting**: Proteger contra abuso
5. **Backup**: Implementar backup automático
