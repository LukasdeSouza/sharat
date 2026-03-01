import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageService } from '../services/LocalStorageService';
import { ValidationService } from '../services/ValidationService';
import type { FormSchema, FieldDefinition } from '../types';

describe('Form Builder Integration Tests - Checkpoint 7', () => {
  let storageService: LocalStorageService;
  let validationService: ValidationService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new LocalStorageService();
    validationService = new ValidationService();
  });

  it('should create a test form with various field types', () => {
    // Create a comprehensive test form with multiple field types
    const testForm: FormSchema = {
      id: 'test-form-checkpoint-7',
      name: 'Comprehensive Test Form',
      description: 'A test form with various field types, validation rules, and conditional logic',
      fields: [
        // Text input with validation
        {
          id: 'field-name',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
          validation: [
            {
              type: 'required',
              message: 'Name is required'
            },
            {
              type: 'minLength',
              value: 3,
              message: 'Name must be at least 3 characters'
            }
          ],
          conditionalLogic: [],
          position: { x: 0, y: 0 },
          width: 100
        },
        // Email input with validation
        {
          id: 'field-email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'your.email@example.com',
          required: true,
          validation: [
            {
              type: 'required',
              message: 'Email is required'
            },
            {
              type: 'email',
              message: 'Must be a valid email address'
            }
          ],
          conditionalLogic: [],
          position: { x: 0, y: 1 },
          width: 100
        },
        // Number input with min/max validation
        {
          id: 'field-age',
          type: 'number',
          label: 'Age',
          placeholder: 'Enter your age',
          required: true,
          validation: [
            {
              type: 'required',
              message: 'Age is required'
            },
            {
              type: 'minValue',
              value: 18,
              message: 'Must be at least 18 years old'
            },
            {
              type: 'maxValue',
              value: 120,
              message: 'Age must be less than 120'
            }
          ],
          conditionalLogic: [],
          position: { x: 0, y: 2 },
          width: 50
        },
        // Dropdown with conditional logic trigger
        {
          id: 'field-country',
          type: 'dropdown',
          label: 'Country',
          placeholder: 'Select your country',
          defaultValue: '',
          required: true,
          validation: [
            {
              type: 'required',
              message: 'Country is required'
            }
          ],
          conditionalLogic: [],
          position: { x: 0, y: 3 },
          width: 100
        },
        // Conditional field - only shows if country is USA
        {
          id: 'field-state',
          type: 'dropdown',
          label: 'State',
          placeholder: 'Select your state',
          required: false,
          validation: [],
          conditionalLogic: [
            {
              fieldId: 'field-country',
              operator: 'equals',
              value: 'USA',
              action: 'show'
            }
          ],
          position: { x: 0, y: 4 },
          width: 100
        },
        // Checkbox
        {
          id: 'field-newsletter',
          type: 'checkbox',
          label: 'Subscribe to newsletter',
          required: false,
          validation: [],
          conditionalLogic: [],
          position: { x: 0, y: 5 },
          width: 100
        },
        // Text area
        {
          id: 'field-comments',
          type: 'textarea',
          label: 'Additional Comments',
          placeholder: 'Enter any additional comments',
          required: false,
          validation: [
            {
              type: 'maxLength',
              value: 500,
              message: 'Comments must be less than 500 characters'
            }
          ],
          conditionalLogic: [],
          position: { x: 0, y: 6 },
          width: 100
        },
        // Date picker
        {
          id: 'field-birthdate',
          type: 'date',
          label: 'Birth Date',
          required: false,
          validation: [],
          conditionalLogic: [],
          position: { x: 0, y: 7 },
          width: 100
        }
      ],
      styling: {
        theme: 'light',
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save the form
    storageService.saveForm(testForm);

    // Verify the form was saved
    const savedForm = storageService.getForm('test-form-checkpoint-7');
    expect(savedForm).not.toBeNull();
    expect(savedForm?.name).toBe('Comprehensive Test Form');
    expect(savedForm?.fields).toHaveLength(8);
  });

  it('should verify validation rules work correctly', () => {
    // Create a form with validation rules
    const form: FormSchema = {
      id: 'validation-test-form',
      name: 'Validation Test',
      description: 'Testing validation',
      fields: [
        {
          id: 'field-required',
          type: 'text',
          label: 'Required Field',
          required: true,
          validation: [
            {
              type: 'required',
              message: 'This field is required'
            }
          ],
          conditionalLogic: [],
          position: { x: 0, y: 0 },
          width: 100
        },
        {
          id: 'field-email',
          type: 'email',
          label: 'Email',
          required: true,
          validation: [
            {
              type: 'required',
              message: 'Email is required'
            },
            {
              type: 'email',
              message: 'Invalid email'
            }
          ],
          conditionalLogic: [],
          position: { x: 0, y: 1 },
          width: 100
        }
      ],
      styling: {
        theme: 'light',
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    storageService.saveForm(form);

    // Test validation with invalid data
    const invalidData = {
      'field-required': '',
      'field-email': 'not-an-email'
    };

    const invalidResult = validationService.validateSubmission(form, invalidData);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);

    // Test validation with valid data
    const validData = {
      'field-required': 'Some value',
      'field-email': 'test@example.com'
    };

    const validResult = validationService.validateSubmission(form, validData);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
  });

  it('should verify conditional logic works correctly', () => {
    // Create a form with conditional logic
    const form: FormSchema = {
      id: 'conditional-test-form',
      name: 'Conditional Logic Test',
      description: 'Testing conditional logic',
      fields: [
        {
          id: 'field-trigger',
          type: 'dropdown',
          label: 'Show Extra Field?',
          required: true,
          validation: [],
          conditionalLogic: [],
          position: { x: 0, y: 0 },
          width: 100
        },
        {
          id: 'field-conditional',
          type: 'text',
          label: 'Conditional Field',
          required: false,
          validation: [],
          conditionalLogic: [
            {
              fieldId: 'field-trigger',
              operator: 'equals',
              value: 'yes',
              action: 'show'
            }
          ],
          position: { x: 0, y: 1 },
          width: 100
        }
      ],
      styling: {
        theme: 'light',
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    storageService.saveForm(form);

    // Test conditional logic - field should be hidden
    const dataHidden = {
      'field-trigger': 'no'
    };

    const conditionalField = form.fields.find(f => f.id === 'field-conditional');
    expect(conditionalField).toBeDefined();

    const shouldShowWhenNo = validationService.evaluateConditionalLogic(
      conditionalField!.conditionalLogic || [],
      dataHidden
    );
    expect(shouldShowWhenNo).toBe(false);

    // Test conditional logic - field should be shown
    const dataShown = {
      'field-trigger': 'yes'
    };

    const shouldShowWhenYes = validationService.evaluateConditionalLogic(
      conditionalField!.conditionalLogic || [],
      dataShown
    );
    expect(shouldShowWhenYes).toBe(true);
  });

  it('should save and reload form to verify persistence', () => {
    // Create a complex form
    const originalForm: FormSchema = {
      id: 'persistence-test-form',
      name: 'Persistence Test Form',
      description: 'Testing form persistence across save/load cycles',
      fields: [
        {
          id: 'field-1',
          type: 'text',
          label: 'Field 1',
          placeholder: 'Enter text',
          required: true,
          validation: [
            {
              type: 'required',
              message: 'Required'
            },
            {
              type: 'minLength',
              value: 5,
              message: 'Min 5 chars'
            }
          ],
          conditionalLogic: [],
          position: { x: 0, y: 0 },
          width: 100
        },
        {
          id: 'field-2',
          type: 'number',
          label: 'Field 2',
          required: true,
          validation: [
            {
              type: 'minValue',
              value: 10,
              message: 'Min value 10'
            }
          ],
          conditionalLogic: [
            {
              fieldId: 'field-1',
              operator: 'equals',
              value: 'show',
              action: 'show'
            }
          ],
          position: { x: 0, y: 1 },
          width: 50
        }
      ],
      styling: {
        theme: 'dark',
        primaryColor: '#ff0000',
        backgroundColor: '#000000',
        fontFamily: 'Courier New'
      },
      workflowId: 'test-workflow-id',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z')
    };

    // Save the form
    storageService.saveForm(originalForm);

    // Reload the form
    const reloadedForm = storageService.getForm('persistence-test-form');

    // Verify all properties are preserved
    expect(reloadedForm).not.toBeNull();
    expect(reloadedForm?.id).toBe(originalForm.id);
    expect(reloadedForm?.name).toBe(originalForm.name);
    expect(reloadedForm?.description).toBe(originalForm.description);
    expect(reloadedForm?.workflowId).toBe(originalForm.workflowId);
    
    // Verify fields are preserved
    expect(reloadedForm?.fields).toHaveLength(2);
    expect(reloadedForm?.fields[0].id).toBe('field-1');
    expect(reloadedForm?.fields[0].type).toBe('text');
    expect(reloadedForm?.fields[0].validation).toHaveLength(2);
    
    // Verify conditional logic is preserved
    expect(reloadedForm?.fields[1].conditionalLogic).toHaveLength(1);
    expect(reloadedForm?.fields[1].conditionalLogic?.[0].fieldId).toBe('field-1');
    
    // Verify styling is preserved
    expect(reloadedForm?.styling.theme).toBe('dark');
    expect(reloadedForm?.styling.primaryColor).toBe('#ff0000');
    
    // Verify dates are preserved as Date objects
    expect(reloadedForm?.createdAt).toBeInstanceOf(Date);
    expect(reloadedForm?.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle multiple save/reload cycles', () => {
    const form: FormSchema = {
      id: 'multi-cycle-form',
      name: 'Original Name',
      description: 'Original Description',
      fields: [],
      styling: {
        theme: 'light',
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // First save
    storageService.saveForm(form);
    let loaded = storageService.getForm('multi-cycle-form');
    expect(loaded?.name).toBe('Original Name');

    // Update and save again
    const updated1 = { ...form, name: 'Updated Name 1' };
    storageService.saveForm(updated1);
    loaded = storageService.getForm('multi-cycle-form');
    expect(loaded?.name).toBe('Updated Name 1');

    // Update and save a third time
    const updated2 = { ...form, name: 'Updated Name 2', description: 'New Description' };
    storageService.saveForm(updated2);
    loaded = storageService.getForm('multi-cycle-form');
    expect(loaded?.name).toBe('Updated Name 2');
    expect(loaded?.description).toBe('New Description');

    // Verify only one form exists (not duplicates)
    const allForms = storageService.getAllForms();
    const matchingForms = allForms.filter(f => f.id === 'multi-cycle-form');
    expect(matchingForms).toHaveLength(1);
  });

  it('should verify all field types are supported', () => {
    const fieldTypes: Array<{ type: any; label: string }> = [
      { type: 'text', label: 'Text Input' },
      { type: 'number', label: 'Number Input' },
      { type: 'email', label: 'Email Input' },
      { type: 'date', label: 'Date Picker' },
      { type: 'dropdown', label: 'Dropdown' },
      { type: 'multiselect', label: 'Multi-Select' },
      { type: 'checkbox', label: 'Checkbox' },
      { type: 'radio', label: 'Radio Button' },
      { type: 'file', label: 'File Upload' },
      { type: 'textarea', label: 'Text Area' }
    ];

    const fields: FieldDefinition[] = fieldTypes.map((ft, index) => ({
      id: `field-${ft.type}`,
      type: ft.type,
      label: ft.label,
      required: false,
      validation: [],
      conditionalLogic: [],
      position: { x: 0, y: index },
      width: 100
    }));

    const form: FormSchema = {
      id: 'all-field-types-form',
      name: 'All Field Types Test',
      description: 'Testing all supported field types',
      fields,
      styling: {
        theme: 'light',
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    storageService.saveForm(form);
    const loaded = storageService.getForm('all-field-types-form');

    expect(loaded).not.toBeNull();
    expect(loaded?.fields).toHaveLength(10);
    
    // Verify each field type is present
    fieldTypes.forEach(ft => {
      const field = loaded?.fields.find(f => f.type === ft.type);
      expect(field).toBeDefined();
      expect(field?.label).toBe(ft.label);
    });
  });
});
