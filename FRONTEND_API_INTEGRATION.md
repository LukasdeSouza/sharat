# Frontend API Integration Guide

## Status: API Services Created ✅

The frontend has been successfully configured to consume the backend API instead of using localStorage.

## What Was Created

### 1. API Services (New Files)

#### `src/services/api.ts`
- Axios instance configured with base URL from environment variables
- Request interceptor to add JWT token to all requests
- Response interceptor to handle 401 errors and redirect to login
- Automatic token management from localStorage

#### `src/services/AuthService.ts`
- `register()` - Create new company and user
- `login()` - Authenticate user and get JWT token
- `getCurrentUser()` - Get current authenticated user
- `logout()` - Clear token from localStorage
- `setToken()` / `getToken()` - Token management
- `isAuthenticated()` - Check if user is logged in

#### `src/services/FormsService.ts`
- `getAllForms()` - Get all forms for current company
- `getForm(id)` - Get single form by ID
- `createForm()` - Create new form
- `updateForm()` - Update existing form
- `deleteForm()` - Delete form

#### `src/services/WorkflowsService.ts`
- `getWorkflowsByForm(formId)` - Get workflows for a form
- `getWorkflow(id)` - Get single workflow
- `createWorkflow()` - Create new workflow
- `updateWorkflow()` - Update workflow
- `deleteWorkflow()` - Delete workflow

#### `src/services/SubmissionsService.ts`
- `getSubmissionsByForm()` - Get submissions with pagination
- `getSubmission(id)` - Get single submission
- `createSubmission()` - Create new submission
- `updateSubmissionStatus()` - Update submission workflow status
- `deleteSubmission()` - Delete submission

### 2. Configuration Files

#### `.env` (Frontend)
```
VITE_API_URL=http://localhost:3001/api
```

#### `package.json` (Updated)
- Added `axios@^1.6.0` dependency

### 3. Updated Pages

#### `src/pages/Home.tsx`
- Replaced `localStorageService` with `formsService` and `workflowsService`
- Added loading state while fetching forms
- Added error handling with error messages
- Async form loading from API
- Async workflow loading for each form
- Async form deletion

## How to Use

### 1. Install Dependencies

```bash
cd shakrat/form-workflow-builder
npm install
```

### 2. Start Backend Server

```bash
cd shakrat/backend
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Start Frontend Development Server

```bash
cd shakrat/form-workflow-builder
npm run dev
```

Frontend will run on `http://localhost:5173` (or similar)

### 4. Test the Integration

1. **Register a new account**
   - Go to `/register`
   - Fill in company name, email, and password
   - Click register

2. **Login**
   - Go to `/login`
   - Use your credentials
   - Token is automatically stored in localStorage

3. **Create a form**
   - Click "New Form" on home page
   - Fill in form details
   - Add fields
   - Save form (will be sent to API)

4. **View forms**
   - Home page loads forms from API
   - Shows loading state while fetching
   - Displays error if API call fails

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - Register new company/user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Forms
- `GET /api/forms` - List all forms
- `GET /api/forms/{id}` - Get single form
- `POST /api/forms` - Create form
- `PUT /api/forms/{id}` - Update form
- `DELETE /api/forms/{id}` - Delete form

### Workflows
- `GET /api/workflows/form/{formId}` - Get workflows for form
- `GET /api/workflows/{id}` - Get single workflow
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/{id}` - Update workflow
- `DELETE /api/workflows/{id}` - Delete workflow

### Submissions
- `GET /api/submissions/form/{formId}` - Get submissions
- `GET /api/submissions/{id}` - Get single submission
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/{id}/status` - Update status
- `DELETE /api/submissions/{id}` - Delete submission

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=rapazQualquer@coisa123
PORT=3001
NODE_ENV=development
```

## Next Steps to Complete Integration

### 1. Update FormBuilder.tsx
- Replace localStorage with `formsService`
- Save form to API instead of localStorage
- Load form from API when editing

### 2. Update FormPreview.tsx
- Load form from API
- Submit form to API via `submissionsService`

### 3. Update WorkflowDesigner.tsx
- Load workflow from API
- Save workflow to API via `workflowsService`

### 4. Update Submissions.tsx
- Load submissions from API
- Display submissions from API
- Filter/search submissions

### 5. Create Login/Register Pages
- Integrate with `authService`
- Store token in localStorage
- Redirect to home on success

### 6. Add Authentication Guard
- Create ProtectedRoute component
- Check if user is authenticated
- Redirect to login if not

## Error Handling

All services include error handling:

```typescript
try {
  const forms = await formsService.getAllForms();
  setForms(forms);
} catch (err) {
  setError('Failed to load forms');
  console.error(err);
}
```

## Token Management

Token is automatically:
- Stored in localStorage on login
- Added to all API requests via interceptor
- Cleared on logout
- Cleared on 401 response (token expired)

## CORS Configuration

Backend has CORS enabled for frontend requests:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Troubleshooting

### API Connection Issues
- Verify backend is running: `curl http://localhost:3001/health`
- Check `VITE_API_URL` in `.env`
- Check browser console for errors

### Authentication Issues
- Verify token is in localStorage: `localStorage.getItem('auth_token')`
- Check token expiration (7 days)
- Login again if token expired

### CORS Errors
- Verify backend CORS is enabled
- Check frontend URL matches backend CORS config
- Check request headers

## Performance Considerations

- Forms are loaded on page mount
- Workflows are loaded for each form (can be optimized)
- Consider adding pagination for large form lists
- Consider caching forms in state

## Security Notes

- JWT tokens stored in localStorage (consider using httpOnly cookies)
- Tokens expire after 7 days
- All requests include Authorization header
- Multi-tenant isolation on backend

---

**Status**: ✅ API services created and Home.tsx updated
**Next**: Update remaining pages (FormBuilder, FormPreview, WorkflowDesigner, Submissions)
**Last Updated**: March 1, 2026
