# Remaining Frontend Updates

## Overview

The following pages still need to be updated to use the API instead of localStorage:

1. **FormBuilder.tsx** - Create/edit forms
2. **FormPreview.tsx** - Preview and submit forms
3. **WorkflowDesigner.tsx** - Create/edit workflows
4. **Submissions.tsx** - View form submissions
5. **Register.tsx** - User registration
6. **Login.tsx** (if exists) - User login

## Quick Update Guide

### FormBuilder.tsx

**Current**: Uses `localStorageService` to save forms
**Update to**: Use `formsService`

Key changes:
```typescript
// OLD
const handleSaveForm = () => {
  localStorageService.saveForm(form);
};

// NEW
const handleSaveForm = async () => {
  try {
    if (form.id) {
      await formsService.updateForm(form.id, form);
    } else {
      const newForm = await formsService.createForm(form);
      setForm(newForm);
    }
  } catch (err) {
    setError('Failed to save form');
  }
};
```

### FormPreview.tsx

**Current**: Loads form from localStorage, saves submission to localStorage
**Update to**: Use `formsService` and `submissionsService`

Key changes:
```typescript
// Load form from API
useEffect(() => {
  const loadForm = async () => {
    try {
      const form = await formsService.getForm(formId);
      setForm(form);
    } catch (err) {
      setError('Failed to load form');
    }
  };
  loadForm();
}, [formId]);

// Submit form to API
const handleSubmit = async (data) => {
  try {
    await submissionsService.createSubmission(formId, data);
    setSuccess('Form submitted successfully');
  } catch (err) {
    setError('Failed to submit form');
  }
};
```

### WorkflowDesigner.tsx

**Current**: Uses `localStorageService` to save workflows
**Update to**: Use `workflowsService`

Key changes:
```typescript
// Load workflow from API
useEffect(() => {
  const loadWorkflow = async () => {
    try {
      const workflows = await workflowsService.getWorkflowsByForm(formId);
      if (workflows.length > 0) {
        setWorkflow(workflows[0]);
      }
    } catch (err) {
      setError('Failed to load workflow');
    }
  };
  loadWorkflow();
}, [formId]);

// Save workflow to API
const handleSaveWorkflow = async () => {
  try {
    if (workflow.id) {
      await workflowsService.updateWorkflow(workflow.id, workflow);
    } else {
      const newWorkflow = await workflowsService.createWorkflow({
        ...workflow,
        formId,
      });
      setWorkflow(newWorkflow);
    }
  } catch (err) {
    setError('Failed to save workflow');
  }
};
```

### Submissions.tsx

**Current**: Loads submissions from localStorage
**Update to**: Use `submissionsService`

Key changes:
```typescript
// Load submissions from API
useEffect(() => {
  const loadSubmissions = async () => {
    try {
      const response = await submissionsService.getSubmissionsByForm(
        formId,
        limit,
        offset
      );
      setSubmissions(response.data);
      setTotal(response.total);
    } catch (err) {
      setError('Failed to load submissions');
    }
  };
  loadSubmissions();
}, [formId, limit, offset]);

// Delete submission
const handleDeleteSubmission = async (submissionId) => {
  try {
    await submissionsService.deleteSubmission(submissionId);
    loadSubmissions();
  } catch (err) {
    setError('Failed to delete submission');
  }
};
```

### Register.tsx

**Current**: Might use localStorage
**Update to**: Use `authService`

Key changes:
```typescript
const handleRegister = async (data) => {
  try {
    const response = await authService.register(
      data.company_name,
      data.email,
      data.password
    );
    authService.setToken(response.token);
    navigate('/');
  } catch (err) {
    setError('Registration failed');
  }
};
```

### Login.tsx (if exists)

**Update to**: Use `authService`

Key changes:
```typescript
const handleLogin = async (email, password) => {
  try {
    const response = await authService.login(email, password);
    authService.setToken(response.token);
    navigate('/');
  } catch (err) {
    setError('Login failed');
  }
};
```

## Common Patterns

### Loading State
```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  try {
    setLoading(true);
    const data = await service.getData();
    setData(data);
  } catch (err) {
    setError('Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

{error && (
  <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
    {error}
  </div>
)}
```

### Async Operations
```typescript
const handleAction = async () => {
  try {
    setLoading(true);
    await service.action();
    setSuccess('Action completed');
    // Reload data
    await loadData();
  } catch (err) {
    setError('Action failed');
  } finally {
    setLoading(false);
  }
};
```

## Testing the Updates

After updating each page:

1. **Test Create**: Create new item via form
2. **Test Read**: Load item from API
3. **Test Update**: Edit and save item
4. **Test Delete**: Delete item
5. **Test Error**: Disconnect backend and verify error handling

## API Response Format

### Forms
```json
{
  "id": "uuid",
  "name": "Contact Form",
  "description": "...",
  "schema": {...},
  "isPublished": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Workflows
```json
{
  "id": "uuid",
  "name": "Approval Workflow",
  "definition": {...},
  "formId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Submissions
```json
{
  "id": "uuid",
  "data": {...},
  "workflowStatus": "PENDING",
  "submittedAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "formId": "uuid"
}
```

## Priority Order

1. **High Priority**: FormPreview.tsx (user-facing)
2. **High Priority**: Submissions.tsx (user-facing)
3. **Medium Priority**: FormBuilder.tsx (core functionality)
4. **Medium Priority**: WorkflowDesigner.tsx (core functionality)
5. **Low Priority**: Register/Login (authentication)

## Notes

- All services handle errors automatically
- Token is added to all requests automatically
- Multi-tenant isolation is handled by backend
- No need to pass company_id - backend extracts from token

---

**Status**: Ready for implementation
**Estimated Time**: 2-3 hours for all updates
**Last Updated**: March 1, 2026
