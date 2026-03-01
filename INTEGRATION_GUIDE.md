# Guia de Integração Frontend + Backend

## Visão Geral

Este guia explica como integrar o frontend React com o backend Express, substituindo localStorage por chamadas à API.

## 1. Configurar API Client

Criar um arquivo `src/services/api.ts` no frontend:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirou, fazer logout
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 2. Criar Auth Service

Arquivo `src/services/AuthService.ts`:

```typescript
import api from './api';

export interface User {
  id: string;
  email: string;
  company_id: string;
  role: 'admin' | 'editor' | 'viewer' | 'approver';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(company_name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', {
      company_name,
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};
```

## 3. Criar Forms Service

Arquivo `src/services/FormsService.ts`:

```typescript
import api from './api';
import type { FormSchema } from '../types';

export const formsService = {
  async getAllForms(): Promise<FormSchema[]> {
    const response = await api.get('/forms');
    return response.data;
  },

  async getForm(id: string): Promise<FormSchema> {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },

  async createForm(form: Omit<FormSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<FormSchema> {
    const response = await api.post('/forms', form);
    return response.data;
  },

  async updateForm(id: string, updates: Partial<FormSchema>): Promise<FormSchema> {
    const response = await api.put(`/forms/${id}`, updates);
    return response.data;
  },

  async deleteForm(id: string): Promise<void> {
    await api.delete(`/forms/${id}`);
  },
};
```

## 4. Criar Workflows Service

Arquivo `src/services/WorkflowsService.ts`:

```typescript
import api from './api';
import type { WorkflowDefinition } from '../types';

export const workflowsService = {
  async getWorkflowsByForm(formId: string): Promise<WorkflowDefinition[]> {
    const response = await api.get(`/workflows/form/${formId}`);
    return response.data;
  },

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    const response = await api.post('/workflows', workflow);
    return response.data;
  },

  async updateWorkflow(id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const response = await api.put(`/workflows/${id}`, updates);
    return response.data;
  },

  async deleteWorkflow(id: string): Promise<void> {
    await api.delete(`/workflows/${id}`);
  },
};
```

## 5. Criar Submissions Service

Arquivo `src/services/SubmissionsService.ts`:

```typescript
import api from './api';
import type { FormSubmission } from '../types';

export interface SubmissionsResponse {
  data: FormSubmission[];
  total: number;
  limit: number;
  offset: number;
}

export const submissionsService = {
  async getSubmissionsByForm(
    formId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SubmissionsResponse> {
    const response = await api.get(`/submissions/form/${formId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  async getSubmission(id: string): Promise<FormSubmission> {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  async createSubmission(formId: string, data: Record<string, any>): Promise<FormSubmission> {
    const response = await api.post('/submissions', {
      form_id: formId,
      data,
    });
    return response.data;
  },

  async updateSubmissionStatus(id: string, status: string): Promise<FormSubmission> {
    const response = await api.put(`/submissions/${id}/status`, {
      workflow_status: status,
    });
    return response.data;
  },

  async deleteSubmission(id: string): Promise<void> {
    await api.delete(`/submissions/${id}`);
  },
};
```

## 6. Atualizar Home.tsx

Substituir localStorage por API:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormSchema, WorkflowDefinition } from '../types';
import { formsService } from '../services/FormsService';
import { workflowsService } from '../services/WorkflowsService';
import { useToast } from '../components/Toast';

export default function Home() {
  const navigate = useNavigate();
  const { error } = useToast();
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [workflows, setWorkflows] = useState<Map<string, WorkflowDefinition>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const allForms = await formsService.getAllForms();
      setForms(allForms);
      
      // Carregar workflows para cada form
      const workflowMap = new Map<string, WorkflowDefinition>();
      for (const form of allForms) {
        const workflows = await workflowsService.getWorkflowsByForm(form.id);
        if (workflows.length > 0) {
          workflowMap.set(form.id, workflows[0]);
        }
      }
      setWorkflows(workflowMap);
    } catch (err) {
      error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (confirm('Are you sure?')) {
      try {
        await formsService.deleteForm(formId);
        loadForms();
      } catch (err) {
        error('Failed to delete form');
      }
    }
  };

  // ... resto do componente
}
```

## 7. Atualizar FormBuilder.tsx

```typescript
const handleSaveForm = async () => {
  try {
    if (currentFormId) {
      // Atualizar form existente
      await formsService.updateForm(currentFormId, {
        name: formName,
        description: formDescription,
        schema: { fields },
      });
    } else {
      // Criar novo form
      const newForm = await formsService.createForm({
        name: formName,
        description: formDescription,
        schema: { fields },
      });
      setCurrentFormId(newForm.id);
    }
    success('Form saved successfully');
  } catch (err) {
    error('Failed to save form');
  }
};
```

## 8. Atualizar FormRenderer.tsx

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // Validar
    const validation = validationService.validateSubmission(form, formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Submeter
    await submissionsService.createSubmission(formId, formData);
    success('Form submitted successfully');
    setFormData({});
  } catch (err) {
    error('Failed to submit form');
  }
};
```

## 9. Atualizar Submissions.tsx

```typescript
const loadSubmissions = async () => {
  try {
    const response = await submissionsService.getSubmissionsByForm(
      selectedFormId,
      limit,
      offset
    );
    setSubmissions(response.data);
    setTotal(response.total);
  } catch (err) {
    error('Failed to load submissions');
  }
};
```

## 10. Variáveis de Ambiente

Criar `.env` no frontend:

```
REACT_APP_API_URL=http://localhost:3001/api
```

## 11. Instalar Dependências

```bash
cd form-workflow-builder
npm install axios
```

## Fluxo de Autenticação

### Register
```
1. User preenche form de registro
2. Frontend: POST /api/auth/register
3. Backend cria company e user
4. Backend retorna token
5. Frontend armazena token em localStorage
6. Frontend redireciona para /forms
```

### Login
```
1. User preenche form de login
2. Frontend: POST /api/auth/login
3. Backend valida credenciais
4. Backend retorna token
5. Frontend armazena token em localStorage
6. Frontend redireciona para /forms
```

### Requisições Autenticadas
```
1. Frontend adiciona token no header
   Authorization: Bearer {token}
2. Backend verifica token
3. Backend extrai user info
4. Backend filtra dados por company_id
5. Backend retorna dados
```

## Tratamento de Erros

```typescript
// Interceptor trata erros automaticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirou
      authService.logout();
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Sem permissão
      toast.error('Insufficient permissions');
    }
    if (error.response?.status === 404) {
      // Não encontrado
      toast.error('Resource not found');
    }
    return Promise.reject(error);
  }
);
```

## Próximos Passos

1. Implementar refresh tokens
2. Adicionar loading states
3. Implementar cache
4. Adicionar retry logic
5. Implementar offline mode
