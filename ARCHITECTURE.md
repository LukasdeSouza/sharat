# Form Workflow Builder - Arquitetura Completa

## Visão Geral

Sistema SaaS multi-tenant para criar forms e workflows com autenticação, autorização e isolamento de dados por empresa.

## Stack Tecnológico

### Frontend
- **React 18** com TypeScript
- **TailwindCSS** para styling (Notion-inspired design)
- **React Router** para navegação
- **React DnD** para drag-and-drop
- **Vite** como build tool

### Backend
- **Node.js + Express** para API REST
- **PostgreSQL** para persistência
- **Redis** para caching e queues (com BullMQ)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

## Arquitetura de Dados

### Multi-Tenant com Company Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                                            │
│  │  Companies   │ (Tenants)                                  │
│  │  (id, name)  │                                            │
│  └──────┬───────┘                                            │
│         │                                                     │
│    ┌────┴────────────────────────────────────────┐           │
│    │                                              │           │
│  ┌─▼──────────┐  ┌──────────────┐  ┌──────────┐ │           │
│  │   Users    │  │    Forms     │  │Workflows │ │           │
│  │ (role)     │  │  (schema)    │  │(steps)   │ │           │
│  └────────────┘  └──────┬───────┘  └────┬─────┘ │           │
│                         │                │       │           │
│                    ┌────▼────────────────▼─┐    │           │
│                    │   Submissions         │    │           │
│                    │   (form responses)    │    │           │
│                    └───────────────────────┘    │           │
│                                                  │           │
│                    ┌──────────────────────┐    │           │
│                    │ Workflow Executions  │    │           │
│                    │ (approval tracking)  │    │           │
│                    └──────────────────────┘    │           │
│                                                  │           │
│  Todos os dados filtrados por company_id ◄─────┘           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Tabelas e Relacionamentos

```sql
companies
├── id (UUID, PK)
├── name
├── email_domain
├── created_at
└── updated_at

users
├── id (UUID, PK)
├── company_id (FK → companies)
├── email (UNIQUE per company)
├── password_hash
├── role (admin, editor, viewer, approver)
├── created_at
└── updated_at

forms
├── id (UUID, PK)
├── company_id (FK → companies)
├── created_by (FK → users)
├── name
├── description
├── schema (JSONB)
├── is_published
├── created_at
└── updated_at

workflows
├── id (UUID, PK)
├── form_id (FK → forms)
├── company_id (FK → companies)
├── name
├── definition (JSONB)
├── created_at
└── updated_at

submissions
├── id (UUID, PK)
├── form_id (FK → forms)
├── company_id (FK → companies)
├── data (JSONB)
├── workflow_status
├── submitted_at
└── updated_at

workflow_executions
├── id (UUID, PK)
├── workflow_id (FK → workflows)
├── submission_id (FK → submissions)
├── current_step
├── status
├── created_at
└── updated_at
```

## Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 1. POST /api/auth/register
                     │    { company_name, email, password }
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Validar input                                            │
│  2. Hash password com bcryptjs                              │
│  3. Criar company                                            │
│  4. Criar user com role 'admin'                             │
│  5. Gerar JWT token                                          │
│                                                               │
│  Response: { token, user }                                   │
│                                                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 2. Armazenar token no localStorage
                     │    Incluir em Authorization header
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Requisições Autenticadas                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GET /api/forms                                              │
│  Authorization: Bearer {token}                               │
│                                                               │
│  Middleware verifica:                                        │
│  1. Token válido?                                            │
│  2. Não expirou?                                             │
│  3. Extrai user info (id, company_id, role)                │
│                                                               │
│  Query filtra por company_id do usuário                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Autorização (Role-Based Access Control)

```
┌──────────────────────────────────────────────────────────┐
│                    User Request                           │
│  PUT /api/forms/{id}                                      │
│  Authorization: Bearer {token}                            │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│              Auth Middleware                              │
│  1. Verificar token                                       │
│  2. Extrair user info                                     │
│  3. Passar para req.user                                  │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────┐
│              Route Handler                                │
│                                                            │
│  if (role === 'viewer') {                                │
│    return 403 Forbidden                                  │
│  }                                                        │
│                                                            │
│  // Verificar se form pertence à company do user         │
│  SELECT * FROM forms                                     │
│  WHERE id = $1 AND company_id = $2                       │
│                                                            │
│  if (!form) {                                            │
│    return 404 Not Found                                  │
│  }                                                        │
│                                                            │
│  // Atualizar form                                       │
│  UPDATE forms SET ...                                    │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

## Roles and Permissions

| Action | Admin | Editor | Viewer | Approver |
|------|-------|--------|--------|----------|
| Create Form | ✓ | ✓ | ✗ | ✗ |
| Edit Form | ✓ | ✓ | ✗ | ✗ |
| Delete Form | ✓ | ✗ | ✗ | ✗ |
| Create Workflow | ✓ | ✓ | ✗ | ✗ |
| Edit Workflow | ✓ | ✓ | ✗ | ✗ |
| Delete Workflow | ✓ | ✗ | ✗ | ✗ |
| View Submissions | ✓ | ✓ | ✓ | ✓ |
| Approve Workflow | ✓ | ✗ | ✗ | ✓ |
| Delete Submission | ✓ | ✗ | ✗ | ✗ |

## Form Creation Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User accesses /forms (Form Builder)                 │
│     Frontend loads localStorage (empty at first)        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. User creates form with drag-and-drop                │
│     - Adds fields                                       │
│     - Configures validation                             │
│     - Defines conditional logic                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. User clica "Save"                                   │
│     Frontend: POST /api/forms                           │
│     {                                                    │
│       name: "Contact Form",                             │
│       description: "...",                               │
│       schema: { fields: [...] }                         │
│     }                                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. Backend validates and saves                         │
│     - Check role (not viewer)                           │
│     - Validate schema                                   │
│     - Insert into database                              │
│     - Return form with ID                               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. Frontend updates UI                                 │
│     - Show "Form saved" toast                           │
│     - Store form ID                                     │
│     - Allow creating a workflow                         │
└─────────────────────────────────────────────────────────┘
```

## Form Submission Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User accesses /preview/{formId}                     │
│     Frontend: GET /api/forms/{formId}                   │
│     Loads form schema                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. User preenche form                                  │
│     - Validação em tempo real                           │
│     - Conditional logic avalia show/hide                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. User clica "Submit"                                 │
│     Frontend: POST /api/submissions                     │
│     {                                                    │
│       form_id: "uuid",                                  │
│       data: { field1: "value1", ... }                   │
│     }                                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. Backend validates and saves                         │
│     - Validate data against schema                      │
│     - Insert into submissions table                     │
│     - Check if there is an associated workflow          │
│     - If so, start workflow execution                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. Frontend shows success                              │
│     - "Submission received" toast                       │
│     - Clear form                                        │
│     - Redirect to home                                  │
└─────────────────────────────────────────────────────────┘
```

## Scalability

### Performance Indexes

```sql
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_forms_company_id ON forms(company_id);
CREATE INDEX idx_workflows_company_id ON workflows(company_id);
CREATE INDEX idx_submissions_company_id ON submissions(company_id);

-- Queries rápidas por form
CREATE INDEX idx_workflows_form_id ON workflows(form_id);
CREATE INDEX idx_submissions_form_id ON submissions(form_id);

-- Queries rápidas por user
CREATE INDEX idx_forms_created_by ON forms(created_by);
```

### Paginação

```javascript
// Backend
GET /api/submissions/form/{formId}?limit=50&offset=0

// Query
SELECT * FROM submissions 
WHERE form_id = $1 AND company_id = $2 
LIMIT 50 OFFSET 0
```

### Isolamento por Company

Cada query filtra por `company_id`:

```javascript
// Garante que user só vê dados da sua empresa
SELECT * FROM forms 
WHERE company_id = $1  // ← Sempre filtrar por company_id
```

## Segurança

### 1. Autenticação
- Senhas hasheadas com bcryptjs (10 rounds)
- JWT tokens com expiração de 7 dias
- Tokens inclusos em Authorization header

### 2. Autorização
- Role-based access control (RBAC)
- Verificação de company_id em cada query
- Validação de permissões antes de operações

### 3. Isolamento de Dados
- Multi-tenant com company_id como chave de isolamento
- Usuários só veem dados da sua empresa
- Queries sempre filtram por company_id

### 4. Validação
- Validação de input em backend
- Sanitização de dados
- Verificação de tipos

## Próximos Passos

### Curto Prazo
1. Integrar frontend com API (substituir localStorage)
2. Implementar refresh tokens
3. Adicionar rate limiting

### Médio Prazo
1. Email notifications para approvals
2. Audit logging
3. Data encryption at rest
4. Backup automático

### Longo Prazo
1. Webhooks para integrações
2. API pública para terceiros
3. Analytics e reporting
4. Escalabilidade horizontal (load balancing)
5. Cache (Redis)
6. Message queue (RabbitMQ/Kafka)
