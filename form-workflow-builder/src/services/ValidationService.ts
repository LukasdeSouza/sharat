import type { FormSchema, FieldDefinition, ValidationRule, ConditionalRule } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: FieldError[];
}

export interface FieldError {
  fieldId: string;
  message: string;
  rule: string;
}

export interface FieldValidationResult {
  valid: boolean;
  error?: string;
}

export class ValidationService {
  /**
   * Validates a single field value against its validation rules
   */
  validateField(field: FieldDefinition, value: any): FieldValidationResult {
    // Check required validation first
    if (field.required && this.isEmpty(value)) {
      return {
        valid: false,
        error: `${field.label} is required`
      };
    }

    // If field is not required and value is empty, skip other validations
    if (!field.required && this.isEmpty(value)) {
      return { valid: true };
    }

    // Validate against each validation rule
    for (const rule of field.validation) {
      const result = this.validateRule(field, value, rule);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  }

  /**
   * Validates a single validation rule
   */
  private validateRule(
    field: FieldDefinition,
    value: any,
    rule: ValidationRule
  ): FieldValidationResult {
    switch (rule.type) {
      case 'required':
        if (this.isEmpty(value)) {
          return {
            valid: false,
            error: rule.message || `${field.label} is required`
          };
        }
        break;

      case 'minLength':
        if (typeof value === 'string' && value.length < rule.value) {
          return {
            valid: false,
            error: rule.message || `${field.label} must be at least ${rule.value} characters`
          };
        }
        break;

      case 'maxLength':
        if (typeof value === 'string' && value.length > rule.value) {
          return {
            valid: false,
            error: rule.message || `${field.label} must be at most ${rule.value} characters`
          };
        }
        break;

      case 'minValue':
        if (typeof value === 'number' && value < rule.value) {
          return {
            valid: false,
            error: rule.message || `${field.label} must be at least ${rule.value}`
          };
        }
        break;

      case 'maxValue':
        if (typeof value === 'number' && value > rule.value) {
          return {
            valid: false,
            error: rule.message || `${field.label} must be at most ${rule.value}`
          };
        }
        break;

      case 'pattern':
        if (typeof value === 'string') {
          const regex = new RegExp(rule.value);
          if (!regex.test(value)) {
            return {
              valid: false,
              error: rule.message || `${field.label} format is invalid`
            };
          }
        }
        break;

      case 'email':
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return {
              valid: false,
              error: rule.message || `${field.label} must be a valid email address`
            };
          }
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Validates an entire form submission against the form schema
   */
  validateSubmission(
    schema: FormSchema,
    data: Record<string, any>
  ): ValidationResult {
    const errors: FieldError[] = [];

    // Get visible fields based on conditional logic
    const visibleFields = schema.fields.filter(field => {
      if (!field.conditionalLogic || field.conditionalLogic.length === 0) {
        return true;
      }
      return this.evaluateConditionalLogic(field.conditionalLogic, data);
    });

    // Validate each visible field
    for (const field of visibleFields) {
      const value = data[field.id];
      const result = this.validateField(field, value);

      if (!result.valid && result.error) {
        errors.push({
          fieldId: field.id,
          message: result.error,
          rule: this.getFailedRuleType(field, value)
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Evaluates conditional logic rules to determine if a field should be visible
   */
  evaluateConditionalLogic(
    rules: ConditionalRule[],
    formData: Record<string, any>
  ): boolean {
    if (rules.length === 0) {
      return true;
    }

    // Group rules by logic operator
    let result = this.evaluateRule(rules[0], formData);

    for (let i = 1; i < rules.length; i++) {
      const rule = rules[i];
      const ruleResult = this.evaluateRule(rule, formData);

      if (rule.logicOperator === 'OR') {
        result = result || ruleResult;
      } else {
        // Default to AND
        result = result && ruleResult;
      }
    }

    return result;
  }

  /**
   * Evaluates a single conditional rule
   */
  private evaluateRule(rule: ConditionalRule, formData: Record<string, any>): boolean {
    const fieldValue = formData[rule.fieldId];
    let conditionMet = false;

    switch (rule.operator) {
      case 'equals':
        conditionMet = fieldValue === rule.value;
        break;

      case 'notEquals':
        conditionMet = fieldValue !== rule.value;
        break;

      case 'contains':
        if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
          conditionMet = fieldValue.includes(rule.value);
        } else if (Array.isArray(fieldValue)) {
          conditionMet = fieldValue.includes(rule.value);
        }
        break;

      case 'greaterThan':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          conditionMet = fieldValue > rule.value;
        }
        break;

      case 'lessThan':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          conditionMet = fieldValue < rule.value;
        }
        break;
    }

    // Apply action (show/hide)
    return rule.action === 'show' ? conditionMet : !conditionMet;
  }

  /**
   * Helper method to check if a value is empty
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim() === '';
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return false;
  }

  /**
   * Helper method to determine which rule type failed
   */
  private getFailedRuleType(field: FieldDefinition, value: any): string {
    if (field.required && this.isEmpty(value)) {
      return 'required';
    }

    for (const rule of field.validation) {
      const result = this.validateRule(field, value, rule);
      if (!result.valid) {
        return rule.type;
      }
    }

    return 'unknown';
  }

  /**
   * Detects circular dependencies in conditional logic rules
   * Returns an array of field IDs that form a circular dependency, or null if no cycles exist
   */
  detectCircularDependencies(fields: FieldDefinition[]): string[] | null {
    // Build a dependency graph: fieldId -> [dependent fieldIds]
    const graph = new Map<string, Set<string>>();
    
    // Initialize graph with all field IDs
    for (const field of fields) {
      if (!graph.has(field.id)) {
        graph.set(field.id, new Set());
      }
      
      // Add dependencies from conditional logic
      if (field.conditionalLogic && field.conditionalLogic.length > 0) {
        for (const rule of field.conditionalLogic) {
          // field depends on rule.fieldId
          graph.get(field.id)!.add(rule.fieldId);
        }
      }
    }

    // Detect cycles using DFS with three states: unvisited, visiting, visited
    const state = new Map<string, 'unvisited' | 'visiting' | 'visited'>();
    const path: string[] = [];
    
    // Initialize all nodes as unvisited
    for (const fieldId of graph.keys()) {
      state.set(fieldId, 'unvisited');
    }

    // DFS function to detect cycles
    const hasCycle = (nodeId: string): boolean => {
      if (state.get(nodeId) === 'visiting') {
        // Found a cycle - return the cycle path
        const cycleStartIndex = path.indexOf(nodeId);
        if (cycleStartIndex !== -1) {
          // Return the cycle portion of the path
          return true;
        }
        return true;
      }

      if (state.get(nodeId) === 'visited') {
        return false;
      }

      // Mark as visiting and add to path
      state.set(nodeId, 'visiting');
      path.push(nodeId);

      // Visit all neighbors
      const neighbors = graph.get(nodeId);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (hasCycle(neighbor)) {
            return true;
          }
        }
      }

      // Mark as visited and remove from path
      state.set(nodeId, 'visited');
      path.pop();
      return false;
    };

    // Check each node for cycles
    for (const fieldId of graph.keys()) {
      if (state.get(fieldId) === 'unvisited') {
        if (hasCycle(fieldId)) {
          // Return the cycle path
          return [...path];
        }
      }
    }

    return null;
  }
}

// Export a singleton instance
export const validationService = new ValidationService();
