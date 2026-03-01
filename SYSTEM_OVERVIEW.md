# System Overview - Form Workflow Builder

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Home/        │  │ Form         │  │ Workflow     │               │
│  │ Dashboard    │  │ Builder      │  │ Designer     │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Form         │  │ Submissions  │  │ Auth Pages   │               │
│  │ Preview      │  │ Management   │  │ (Login/Reg)  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                       │
│  Services:                                                            │
│  ├── AuthService (login, register)                                  │
│  ├── FormsService (CRUD forms)                                      │
│  ├── WorkflowsService (CRUD workflows)                              │
│  ├── SubmissionsService (CRUD submissions)                          │
│  └── ValidationService (validate forms)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    HTTP/REST API
                    (JWT Token)
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      BACKEND (Node.js)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Auth Routes  │  │ Forms Routes │  │ Workflows    │               │
│  │ - register   │  │ - GET /      │  │ Routes       │               │
│  │ - login      │  │ - POST /     │  │ - GET /      │               │
│  │ - me         │  │ - PUT /{id}  │  │ - POST /     │               │
│  └──────────────┘  │ - DELETE /{} │  │ - PUT /{id}  │               │
│                    └──────────────┘  │ - DELETE /{} │               │
│  ┌──────────────┐                    └──────────────┘               │
│  │ Submissions  │  ┌──────────────┐                                 │
│  │ Routes       │  │ Middleware   │                                 │
│  │ - GET /      │  │ - Auth       │                                 │
│  │ - POST /     │  │ - CORS       │                                 │
│  │ - PUT /{id}  │  │ - Error      │                                 │
│  │ - DELETE /{} │  │   handling   │                                 │
│  └──────────────┘  └──────────────┘                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                        SQL Queries
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ companies    │  │ users        │  │ forms        │               │
│  │ - id         │  │ - id         │  │ - id         │               │
│  │ - name       │  │ - company_id │  │ - company_id │               │
│  │ - created_at │  │ - email      │  │ - created_by │               │
│  └──────────────┘  │ - role       │  │ - schema     │               │
│                    │ - created_at │  │ - created_at │               │
│  ┌──────────────┐  └──────────────┘  └──────────────┘               │
│  │ workflows    │  ┌──────────────┐  ┌──────────────┐               │
│  │ - id         │  │ submissions  │  │ workflow_    │               │
│  │ - form_id    │  │ - id         │  │ executions   │               │
│  │ - definition │  │ - form_id    │  │ - id         │               │
│  │ - created_at │  │ - data       │  │ - status     │               │
│  └──────────────┘  │ - created_at │  │ - created_at │               │
│                    └──────────────┘  └──────────────┘               │
│                                                                       │
│  Indexes:                                                             │
│  ├── idx_users_company_id                                           │
│  ├── idx_forms_company_id                                           │
│  ├── idx_workflows_form_id                                          │
│  ├── idx_submissions_form_id                                        │
│  └── ... (10+ indexes for performance)                              │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

### 1. Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│ User                                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 1. Preenche form de registro
                 │    (company_name, email, password)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                     │
│ POST /api/auth/register                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 2. Envia dados
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend                                                      │
│ 1. Validar input                                            │
│ 2. Hash password                                            │
│ 3. Criar company                                            │
│ 4. Criar user com role 'admin'                             │
│ 5. Gerar JWT token                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 3. Retorna token + user
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                     │
│ 1. Armazena token em localStorage                           │
│ 2. Redireciona para /forms                                  │
│ 3. Inclui token em Authorization header                     │
└─────────────────────────────────────────────────────────────┘
```

### 2. Criar Form

```
┌─────────────────────────────────────────────────────────────┐
│ User                                                         │
│ Acessa /forms (Form Builder)                                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 1. Drag-and-drop fields
                 │ 2. Configure validation
                 │ 3. Define conditional logic
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                     │
│ POST /api/forms                                             │
│ {                                                            │
│   name: "Contact Form",                                     │
│   schema: { fields: [...] }                                 │
│ }                                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 2. Envia schema
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend                                                      │
│ 1. Verificar role (não viewer)                             │
│ 2. Validar schema                                           │
│ 3. Inserir em database                                      │
│ 4. Retornar form com ID                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 3. Retorna form com ID
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                     │
│ 1. Mostrar toast "Form saved"                               │
│ 2. Armazenar form ID                                        │
│ 3. Permitir criar workflow                                  │
└─────────────────────────────────────────────────────────────┘
```

### 3. Submeter Form

```
┌─────────────────────────────────────────────────────────────┐
│ User                                                         │
│ Acessa /preview/{formId}                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 1. Carrega form
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                     │
│ GET /api/forms/{formId}                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 2. Retorna schema
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                     │
│ Renderiza form com campos                                   │
│ - Validação em tempo real                                   │
│ - Conditional logic avalia show/hide                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 3. User preenche e submete
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                     │
│ POST /api/submissions                                       │
│ {                                                            │
│   form_id: "uuid",                                          │
│   data: { field1: "value1", ... }                           │
│ }                                                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 4. Envia dados
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend                                                      │
│ 1. Validar dados contra schema                              │
│ 2. Inserir em submissions table                             │
│ 3. Verificar se há workflow                                 │
│ 4. Se sim, iniciar workflow execution                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ 5. Retorna sucesso
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                     │
│ 1. Toast "Submission received"                              │
│ 2. Limpar form                                              │
│ 3. Redirecionar para home                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Segurança

```
┌─────────────────────────────────────────────────────────────┐
│ Camadas de Segurança                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. AUTENTICAÇÃO                                              │
│    ├── Senhas hasheadas com bcryptjs (10 rounds)            │
│    ├── JWT tokens com expiração de 7 dias                   │
│    └── Tokens inclusos em Authorization header              │
│                                                               │
│ 2. AUTORIZAÇÃO                                               │
│    ├── Role-based access control (RBAC)                     │
│    ├── Verificação de company_id em cada query              │
│    └── Validação de permissões antes de operações           │
│                                                               │
│ 3. ISOLAMENTO DE DADOS                                       │
│    ├── Multi-tenant com company_id como chave               │
│    ├── Usuários só veem dados da sua empresa                │
│    └── Queries sempre filtram por company_id                │
│                                                               │
│ 4. VALIDAÇÃO                                                 │
│    ├── Validação de input em backend                        │
│    ├── Sanitização de dados                                 │
│    └── Verificação de tipos                                 │
│                                                               │
│ 5. COMUNICAÇÃO                                               │
│    ├── HTTPS em produção                                    │
│    ├── CORS configurado                                     │
│    └── Rate limiting (futuro)                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Roles e Permissões

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN                                                        │
├─────────────────────────────────────────────────────────────┤
│ ✓ Criar/editar/deletar forms                                │
│ ✓ Criar/editar/deletar workflows                            │
│ ✓ Ver/deletar submissions                                   │
│ ✓ Aprovar/rejeitar workflows                                │
│ ✓ Gerenciar usuários                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EDITOR                                                       │
├─────────────────────────────────────────────────────────────┤
│ ✓ Criar/editar forms                                        │
│ ✓ Criar/editar workflows                                    │
│ ✓ Ver submissions                                           │
│ ✗ Deletar forms/workflows                                   │
│ ✗ Gerenciar usuários                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ VIEWER                                                       │
├─────────────────────────────────────────────────────────────┤
│ ✓ Ver forms                                                 │
│ ✓ Ver submissions                                           │
│ ✗ Criar/editar forms                                        │
│ ✗ Criar/editar workflows                                    │
│ ✗ Deletar dados                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ APPROVER                                                     │
├─────────────────────────────────────────────────────────────┤
│ ✓ Ver submissions                                           │
│ ✓ Aprovar/rejeitar workflows                                │
│ ✗ Criar/editar forms                                        │
│ ✗ Deletar dados                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Escalabilidade

```
┌─────────────────────────────────────────────────────────────┐
│ Estratégias de Escalabilidade                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. DATABASE                                                  │
│    ├── Índices para queries rápidas                         │
│    ├── Paginação em submissions                             │
│    ├── Connection pooling                                   │
│    └── Replicação (futuro)                                  │
│                                                               │
│ 2. BACKEND                                                   │
│    ├── Stateless (pronto para load balancing)               │
│    ├── Caching (Redis - futuro)                             │
│    ├── Message queue (RabbitMQ - futuro)                    │
│    └── Horizontal scaling                                   │
│                                                               │
│ 3. FRONTEND                                                  │
│    ├── Code splitting                                       │
│    ├── Lazy loading                                         │
│    ├── CDN para assets                                      │
│    └── Service workers (futuro)                             │
│                                                               │
│ 4. INFRAESTRUTURA                                            │
│    ├── Load balancer (Nginx)                                │
│    ├── Auto-scaling groups                                  │
│    ├── Monitoring e alertas                                 │
│    └── Backup automático                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📈 Métricas Importantes

```
┌─────────────────────────────────────────────────────────────┐
│ Monitorar                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Backend:                                                     │
│ ├── Response time (< 200ms)                                 │
│ ├── Error rate (< 1%)                                       │
│ ├── CPU usage (< 80%)                                       │
│ ├── Memory usage (< 80%)                                    │
│ └── Database connections (< 100)                            │
│                                                               │
│ Database:                                                    │
│ ├── Query time (< 100ms)                                    │
│ ├── Connection pool usage                                   │
│ ├── Disk space                                              │
│ └── Backup status                                           │
│                                                               │
│ Frontend:                                                    │
│ ├── Page load time (< 3s)                                   │
│ ├── Time to interactive (< 5s)                              │
│ ├── Error rate                                              │
│ └── User engagement                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Ciclo de Vida de um Form

```
┌──────────────┐
│   CREATED    │  Form criado no builder
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   EDITING    │  User edita form
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  PUBLISHED   │  Form publicado
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  RECEIVING   │  Recebendo submissions
│ SUBMISSIONS  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  WORKFLOW    │  Processando workflows
│  EXECUTION   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  COMPLETED   │  Workflow completado
└──────────────┘
```

---

**Próximos passos:**
1. Ler `QUICK_START.md` para começar
2. Ler `ARCHITECTURE.md` para entender a arquitetura
3. Ler `INTEGRATION_GUIDE.md` para integrar frontend + backend
4. Ler `DEPLOYMENT_GUIDE.md` para fazer deploy
