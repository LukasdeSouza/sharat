import React, { useState, useEffect } from 'react';
import type { FormSchema, FieldDefinition } from '../types';
import { validationService } from '../services/ValidationService';
import {
  TextInput,
  NumberInput,
  EmailInput,
  DatePicker,
  TextArea,
  Dropdown,
  MultiSelect,
  Checkbox,
  Radio,
  FileUpload,
} from './fields';

interface FormRendererProps {
  formSchema: FormSchema;
  mode: 'preview' | 'submit';
  onSubmit?: (data: Record<string, any>) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  formSchema,
  mode,
  onSubmit,
}) => {
  // Form data state
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Field errors state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Touched fields (for validation on blur)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<string, any> = {};
    formSchema.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      } else {
        // Set appropriate empty values based on field type
        switch (field.type) {
          case 'checkbox':
            initialData[field.id] = false;
            break;
          case 'multiselect':
            initialData[field.id] = [];
            break;
          case 'number':
            initialData[field.id] = '';
            break;
          default:
            initialData[field.id] = '';
        }
      }
    });
    setFormData(initialData);
  }, [formSchema]);

  // Get visible fields based on conditional logic
  const getVisibleFields = (): FieldDefinition[] => {
    return formSchema.fields.filter(field => {
      if (!field.conditionalLogic || field.conditionalLogic.length === 0) {
        return true;
      }
      return validationService.evaluateConditionalLogic(field.conditionalLogic, formData);
    });
  };

  // Handle field value change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error for this field when user starts typing
    if (fieldErrors[fieldId]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Handle field blur (validate on blur)
  const handleFieldBlur = (field: FieldDefinition) => {
    setTouchedFields(prev => new Set(prev).add(field.id));

    // Only validate if field is visible
    const visibleFields = getVisibleFields();
    if (!visibleFields.find(f => f.id === field.id)) {
      return;
    }

    const value = formData[field.id];
    const result = validationService.validateField(field, value);

    if (!result.valid && result.error) {
      setFieldErrors(prev => ({
        ...prev,
        [field.id]: result.error!
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get only visible fields for validation
    const visibleFields = getVisibleFields();

    // Create a schema with only visible fields for validation
    const validationSchema = {
      ...formSchema,
      fields: visibleFields
    };

    // Validate the submission
    const validationResult = validationService.validateSubmission(
      validationSchema,
      formData
    );

    if (!validationResult.valid) {
      // Set all field errors
      const errors: Record<string, string> = {};
      validationResult.errors.forEach(error => {
        errors[error.fieldId] = error.message;
      });
      setFieldErrors(errors);

      // Mark all fields as touched
      const allFieldIds = visibleFields.map(f => f.id);
      setTouchedFields(new Set(allFieldIds));

      return;
    }

    // Filter form data to only include visible fields
    const submissionData: Record<string, any> = {};
    visibleFields.forEach(field => {
      submissionData[field.id] = formData[field.id];
    });

    // Call onSubmit callback with filtered data
    if (onSubmit) {
      onSubmit(submissionData);
    }
  };

  // Render a single field based on its type
  const renderField = (field: FieldDefinition) => {
    const value = formData[field.id] ?? '';
    const error = touchedFields.has(field.id) ? fieldErrors[field.id] : undefined;
    const commonProps = {
      value,
      onChange: (newValue: any) => handleFieldChange(field.id, newValue),
      label: field.label,
      placeholder: field.placeholder,
      error,
      required: field.required,
    };

    switch (field.type) {
      case 'text':
        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <TextInput {...commonProps} />
          </div>
        );

      case 'number':
        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <NumberInput {...commonProps} />
          </div>
        );

      case 'email':
        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <EmailInput {...commonProps} />
          </div>
        );

      case 'date':
        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <DatePicker {...commonProps} />
          </div>
        );

      case 'textarea':
        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <TextArea {...commonProps} rows={4} />
          </div>
        );

      case 'dropdown':
        // Use options if defined, fall back to parsing placeholder (legacy)
        const dropdownOptions = (field.options && field.options.length > 0)
          ? field.options
          : (field.placeholder
            ? field.placeholder.split(',').map(opt => ({
              id: opt.trim(),
              value: opt.trim(),
              label: opt.trim()
            }))
            : []);

        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <Dropdown {...commonProps} options={dropdownOptions} />
          </div>
        );

      case 'multiselect':
        // Use options if defined, fall back to parsing placeholder (legacy)
        const multiSelectOptions = (field.options && field.options.length > 0)
          ? field.options
          : (field.placeholder
            ? field.placeholder.split(',').map(opt => ({
              id: opt.trim(),
              value: opt.trim(),
              label: opt.trim()
            }))
            : []);

        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <MultiSelect {...commonProps} options={multiSelectOptions} />
          </div>
        );

      case 'checkbox':
        // Use options if defined, fall back to parsing placeholder (legacy)
        const checkboxOptions = (field.options && field.options.length > 0)
          ? field.options
          : (field.placeholder
            ? field.placeholder.split(',').map(opt => ({
              id: opt.trim(),
              value: opt.trim(),
              label: opt.trim()
            }))
            : []);

        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <Checkbox {...commonProps} options={checkboxOptions} />
          </div>
        );

      case 'radio':
        // Use options if defined, fall back to parsing placeholder (legacy)
        const radioOptions = (field.options && field.options.length > 0)
          ? field.options
          : (field.placeholder
            ? field.placeholder.split(',').map(opt => ({
              id: opt.trim(),
              value: opt.trim(),
              label: opt.trim()
            }))
            : []);

        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <Radio {...commonProps} options={radioOptions} />
          </div>
        );

      case 'file':
        return (
          <div onBlur={() => handleFieldBlur(field)}>
            <FileUpload {...commonProps} accept={field.accept} />
          </div>
        );

      default:
        return null;
    }
  };

  const visibleFields = getVisibleFields();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{formSchema.name}</h2>
        {formSchema.description && (
          <p className="mt-2 text-gray-600">{formSchema.description}</p>
        )}
      </div>

      {/* Render visible fields */}
      {visibleFields.map(field => (
        <div key={field.id}>
          {renderField(field)}
        </div>
      ))}

      {/* Submit button */}
      {mode === 'submit' && (
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-slate-600 text-white py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
          >
            Submit
          </button>
        </div>
      )}
    </form>
  );
};
