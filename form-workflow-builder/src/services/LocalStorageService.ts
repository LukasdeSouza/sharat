import type { FormSchema, WorkflowDefinition, FormSubmission } from '../types';

const STORAGE_KEYS = {
  FORMS: 'formBuilder_forms',
  WORKFLOWS: 'formBuilder_workflows',
  SUBMISSIONS: 'formBuilder_submissions',
  SETTINGS: 'formBuilder_settings'
} as const;

export class LocalStorageService {
  // Forms
  saveForm(form: FormSchema): void {
    try {
      const forms = this.getAllForms();
      const existingIndex = forms.findIndex(f => f.id === form.id);
      
      if (existingIndex >= 0) {
        forms[existingIndex] = form;
      } else {
        forms.push(form);
      }
      
      localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear old data or export your forms.');
      }
      throw error;
    }
  }

  getForm(id: string): FormSchema | null {
    const forms = this.getAllForms();
    const form = forms.find(f => f.id === id);
    
    if (!form) {
      return null;
    }
    
    // Convert date strings back to Date objects
    return {
      ...form,
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt)
    };
  }

  getAllForms(): FormSchema[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FORMS);
      if (!data) {
        return [];
      }
      
      const forms = JSON.parse(data);
      // Convert date strings back to Date objects
      return forms.map((form: any) => ({
        ...form,
        createdAt: new Date(form.createdAt),
        updatedAt: new Date(form.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading forms from localStorage:', error);
      return [];
    }
  }

  deleteForm(id: string): void {
    const forms = this.getAllForms();
    const filtered = forms.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(filtered));
    
    // Also delete associated workflow if exists
    const workflow = this.getWorkflowByFormId(id);
    if (workflow) {
      this.deleteWorkflow(workflow.id);
    }
    
    // Delete associated submissions
    const submissions = this.getSubmissionsByFormId(id);
    submissions.forEach(submission => {
      this.deleteSubmission(submission.id);
    });
  }

  // Workflows
  saveWorkflow(workflow: WorkflowDefinition): void {
    try {
      const workflows = this.getAllWorkflows();
      const existingIndex = workflows.findIndex(w => w.id === workflow.id);
      
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow;
      } else {
        workflows.push(workflow);
      }
      
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear old data or export your workflows.');
      }
      throw error;
    }
  }

  getWorkflow(id: string): WorkflowDefinition | null {
    const workflows = this.getAllWorkflows();
    const workflow = workflows.find(w => w.id === id);
    
    if (!workflow) {
      return null;
    }
    
    // Convert date strings back to Date objects
    return {
      ...workflow,
      createdAt: new Date(workflow.createdAt),
      updatedAt: new Date(workflow.updatedAt)
    };
  }

  getWorkflowByFormId(formId: string): WorkflowDefinition | null {
    const workflows = this.getAllWorkflows();
    const workflow = workflows.find(w => w.formId === formId);
    
    if (!workflow) {
      return null;
    }
    
    // Convert date strings back to Date objects
    return {
      ...workflow,
      createdAt: new Date(workflow.createdAt),
      updatedAt: new Date(workflow.updatedAt)
    };
  }

  getAllWorkflows(): WorkflowDefinition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      if (!data) {
        return [];
      }
      
      const workflows = JSON.parse(data);
      // Convert date strings back to Date objects
      return workflows.map((workflow: any) => ({
        ...workflow,
        createdAt: new Date(workflow.createdAt),
        updatedAt: new Date(workflow.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading workflows from localStorage:', error);
      return [];
    }
  }

  deleteWorkflow(id: string): void {
    const workflows = this.getAllWorkflows();
    const filtered = workflows.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(filtered));
  }

  // Submissions
  saveSubmission(submission: FormSubmission): void {
    try {
      const submissions = this.getAllSubmissions();
      const existingIndex = submissions.findIndex(s => s.id === submission.id);
      
      if (existingIndex >= 0) {
        submissions[existingIndex] = submission;
      } else {
        submissions.push(submission);
      }
      
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear old data or export your submissions.');
      }
      throw error;
    }
  }

  getSubmission(id: string): FormSubmission | null {
    const submissions = this.getAllSubmissions();
    const submission = submissions.find(s => s.id === id);
    
    if (!submission) {
      return null;
    }
    
    // Convert date strings back to Date objects
    return {
      ...submission,
      submittedAt: new Date(submission.submittedAt)
    };
  }

  getSubmissionsByFormId(formId: string): FormSubmission[] {
    const submissions = this.getAllSubmissions();
    return submissions
      .filter(s => s.formId === formId)
      .map(submission => ({
        ...submission,
        submittedAt: new Date(submission.submittedAt)
      }));
  }

  getAllSubmissions(): FormSubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (!data) {
        return [];
      }
      
      const submissions = JSON.parse(data);
      // Convert date strings back to Date objects
      return submissions.map((submission: any) => ({
        ...submission,
        submittedAt: new Date(submission.submittedAt)
      }));
    } catch (error) {
      console.error('Error loading submissions from localStorage:', error);
      return [];
    }
  }

  deleteSubmission(id: string): void {
    const submissions = this.getAllSubmissions();
    const filtered = submissions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(filtered));
  }

  // Utility methods
  exportAllData(): string {
    const data = {
      forms: this.getAllForms(),
      workflows: this.getAllWorkflows(),
      submissions: this.getAllSubmissions(),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.forms || !Array.isArray(data.forms)) {
        throw new Error('Invalid data format: missing or invalid forms array');
      }
      
      // Import forms
      if (data.forms && Array.isArray(data.forms)) {
        localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(data.forms));
      }
      
      // Import workflows
      if (data.workflows && Array.isArray(data.workflows)) {
        localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(data.workflows));
      }
      
      // Import submissions
      if (data.submissions && Array.isArray(data.submissions)) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data.submissions));
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please provide valid JSON data.');
      }
      throw error;
    }
  }

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.FORMS);
    localStorage.removeItem(STORAGE_KEYS.WORKFLOWS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }

  getStorageUsage(): { used: number; available: number } {
    let used = 0;
    
    // Calculate used storage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Most browsers have a 5-10MB limit for localStorage
    // We'll use 5MB as a conservative estimate
    const available = 5 * 1024 * 1024; // 5MB in bytes
    
    return {
      used,
      available
    };
  }
}

// Export a singleton instance
export const localStorageService = new LocalStorageService();
