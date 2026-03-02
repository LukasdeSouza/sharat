import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageService } from './LocalStorageService';
import type { FormSchema, WorkflowDefinition, FormSubmission } from '../types';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    service = new LocalStorageService();
  });

  describe('Forms', () => {
    it('should save and retrieve a form', () => {
      const form: FormSchema = {
        id: 'test-form-1',
        name: 'Test Form',
        description: 'A test form',
        fields: [],
        styling: {
          theme: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      service.saveForm(form);
      const retrieved = service.getForm('test-form-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(form.id);
      expect(retrieved?.name).toBe(form.name);
      expect(retrieved?.description).toBe(form.description);
    });

    it('should return null for non-existent form', () => {
      const retrieved = service.getForm('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should get all forms', () => {
      const form1: FormSchema = {
        id: 'form-1',
        name: 'Form 1',
        description: 'First form',
        fields: [],
        styling: {
          theme: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const form2: FormSchema = {
        id: 'form-2',
        name: 'Form 2',
        description: 'Second form',
        fields: [],
        styling: {
          theme: 'dark',
          primaryColor: '#ffffff',
          backgroundColor: '#000000',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.saveForm(form1);
      service.saveForm(form2);

      const allForms = service.getAllForms();
      expect(allForms).toHaveLength(2);
      expect(allForms.map(f => f.id)).toContain('form-1');
      expect(allForms.map(f => f.id)).toContain('form-2');
    });

    it('should update existing form', () => {
      const form: FormSchema = {
        id: 'form-1',
        name: 'Original Name',
        description: 'Original description',
        fields: [],
        styling: {
          theme: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.saveForm(form);

      const updatedForm = { ...form, name: 'Updated Name' };
      service.saveForm(updatedForm);

      const allForms = service.getAllForms();
      expect(allForms).toHaveLength(1);
      expect(allForms[0].name).toBe('Updated Name');
    });

    it('should delete a form', () => {
      const form: FormSchema = {
        id: 'form-to-delete',
        name: 'Delete Me',
        description: 'This will be deleted',
        fields: [],
        styling: {
          theme: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.saveForm(form);
      expect(service.getForm('form-to-delete')).not.toBeNull();

      service.deleteForm('form-to-delete');
      expect(service.getForm('form-to-delete')).toBeNull();
    });
  });

  describe('Workflows', () => {
    it('should save and retrieve a workflow', () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        formId: 'form-1',
        name: 'Test Workflow',
        steps: [],
        connections: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      service.saveWorkflow(workflow);
      const retrieved = service.getWorkflow('workflow-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(workflow.id);
      expect(retrieved?.formId).toBe(workflow.formId);
      expect(retrieved?.name).toBe(workflow.name);
    });

    it('should get workflow by form ID', () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        formId: 'form-1',
        name: 'Test Workflow',
        steps: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.saveWorkflow(workflow);
      const retrieved = service.getWorkflowByFormId('form-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('workflow-1');
    });

    it('should delete a workflow', () => {
      const workflow: WorkflowDefinition = {
        id: 'workflow-to-delete',
        formId: 'form-1',
        name: 'Delete Me',
        steps: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.saveWorkflow(workflow);
      expect(service.getWorkflow('workflow-to-delete')).not.toBeNull();

      service.deleteWorkflow('workflow-to-delete');
      expect(service.getWorkflow('workflow-to-delete')).toBeNull();
    });
  });

  describe('Submissions', () => {
    it('should save and retrieve a submission', () => {
      const submission: FormSubmission = {
        id: 'submission-1',
        formId: 'form-1',
        data: { field1: 'value1', field2: 'value2' },
        submittedBy: 'user@example.com',
        submittedAt: new Date('2024-01-01')
      };

      service.saveSubmission(submission);
      const retrieved = service.getSubmission('submission-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(submission.id);
      expect(retrieved?.formId).toBe(submission.formId);
      expect(retrieved?.data).toEqual(submission.data);
    });

    it('should get submissions by form ID', () => {
      const submission1: FormSubmission = {
        id: 'sub-1',
        formId: 'form-1',
        data: { field: 'value1' },
        submittedAt: new Date()
      };

      const submission2: FormSubmission = {
        id: 'sub-2',
        formId: 'form-1',
        data: { field: 'value2' },
        submittedAt: new Date()
      };

      const submission3: FormSubmission = {
        id: 'sub-3',
        formId: 'form-2',
        data: { field: 'value3' },
        submittedAt: new Date()
      };

      service.saveSubmission(submission1);
      service.saveSubmission(submission2);
      service.saveSubmission(submission3);

      const form1Submissions = service.getSubmissionsByFormId('form-1');
      expect(form1Submissions).toHaveLength(2);
      expect(form1Submissions.map(s => s.id)).toContain('sub-1');
      expect(form1Submissions.map(s => s.id)).toContain('sub-2');
    });

    it('should delete a submission', () => {
      const submission: FormSubmission = {
        id: 'sub-to-delete',
        formId: 'form-1',
        data: {},
        submittedAt: new Date()
      };

      service.saveSubmission(submission);
      expect(service.getSubmission('sub-to-delete')).not.toBeNull();

      service.deleteSubmission('sub-to-delete');
      expect(service.getSubmission('sub-to-delete')).toBeNull();
    });
  });

  describe('Utility methods', () => {
    it('should export all data', () => {
      const form: FormSchema = {
        id: 'form-1',
        name: 'Test Form',
        description: 'Test',
        fields: [],
        styling: {
          theme: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.saveForm(form);

      const exported = service.exportAllData();
      expect(exported).toBeTruthy();
      
      const parsed = JSON.parse(exported);
      expect(parsed.forms).toHaveLength(1);
      expect(parsed.forms[0].id).toBe('form-1');
      expect(parsed.exportedAt).toBeTruthy();
    });

    it('should import data', () => {
      const data = {
        forms: [{
          id: 'imported-form',
          name: 'Imported Form',
          description: 'Imported',
          fields: [],
          styling: {
            theme: 'light',
            primaryColor: '#000000',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        workflows: [],
        submissions: []
      };

      service.importData(JSON.stringify(data));

      const forms = service.getAllForms();
      expect(forms).toHaveLength(1);
      expect(forms[0].id).toBe('imported-form');
    });

    it('should throw error on invalid JSON import', () => {
      expect(() => {
        service.importData('invalid json');
      }).toThrow('Invalid JSON format');
    });

    it('should throw error on invalid data format', () => {
      expect(() => {
        service.importData('{"invalid": "data"}');
      }).toThrow('Invalid data format');
    });

    it('should clear all data', () => {
      const form: FormSchema = {
        id: 'form-1',
        name: 'Test',
        description: 'Test',
        fields: [],
        styling: {
          theme: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.saveForm(form);
      expect(service.getAllForms()).toHaveLength(1);

      service.clearAllData();
      expect(service.getAllForms()).toHaveLength(0);
    });

    it('should get storage usage', () => {
      const usage = service.getStorageUsage();
      
      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('available');
      expect(typeof usage.used).toBe('number');
      expect(typeof usage.available).toBe('number');
      expect(usage.available).toBeGreaterThan(0);
    });
  });

  describe('Cascading deletes', () => {
    it('should delete associated workflow when form is deleted', () => {
      const form: FormSchema = {
        id: 'form-1',
        name: 'Test Form',
        description: 'Test',
        fields: [],
        styling: {
          theme: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const workflow: WorkflowDefinition = {
        id: 'workflow-1',
        formId: 'form-1',
        name: 'Test Workflow',
        steps: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.saveForm(form);
      service.saveWorkflow(workflow);

      expect(service.getWorkflow('workflow-1')).not.toBeNull();

      service.deleteForm('form-1');

      expect(service.getForm('form-1')).toBeNull();
      expect(service.getWorkflow('workflow-1')).toBeNull();
    });

    it('should delete associated submissions when form is deleted', () => {
      const form: FormSchema = {
        id: 'form-1',
        name: 'Test Form',
        description: 'Test',
        fields: [],
        styling: {
          theme: 'light',
          primaryColor: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial'
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const submission: FormSubmission = {
        id: 'sub-1',
        formId: 'form-1',
        data: {},
        submittedAt: new Date()
      };

      service.saveForm(form);
      service.saveSubmission(submission);

      expect(service.getSubmission('sub-1')).not.toBeNull();

      service.deleteForm('form-1');

      expect(service.getForm('form-1')).toBeNull();
      expect(service.getSubmission('sub-1')).toBeNull();
    });
  });
});
