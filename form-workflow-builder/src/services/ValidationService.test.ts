import { describe, it, expect } from 'vitest';
import { ValidationService } from './ValidationService';
import type { FieldDefinition } from '../types';

describe('ValidationService - Circular Dependency Detection', () => {
  const validationService = new ValidationService();

  it('should detect no circular dependencies in a simple form', () => {
    const fields: FieldDefinition[] = [
      {
        id: 'field1',
        type: 'text',
        label: 'Field 1',
        required: false,
        validation: [],
        conditionalLogic: [],
        position: { x: 0, y: 0 },
        width: 100,
      },
      {
        id: 'field2',
        type: 'text',
        label: 'Field 2',
        required: false,
        validation: [],
        conditionalLogic: [],
        position: { x: 0, y: 100 },
        width: 100,
      },
    ];

    const result = validationService.detectCircularDependencies(fields);
    expect(result).toBeNull();
  });

  it('should detect no circular dependencies when field2 depends on field1', () => {
    const fields: FieldDefinition[] = [
      {
        id: 'field1',
        type: 'text',
        label: 'Field 1',
        required: false,
        validation: [],
        conditionalLogic: [],
        position: { x: 0, y: 0 },
        width: 100,
      },
      {
        id: 'field2',
        type: 'text',
        label: 'Field 2',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 100 },
        width: 100,
      },
    ];

    const result = validationService.detectCircularDependencies(fields);
    expect(result).toBeNull();
  });

  it('should detect direct circular dependency (field1 -> field2 -> field1)', () => {
    const fields: FieldDefinition[] = [
      {
        id: 'field1',
        type: 'text',
        label: 'Field 1',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field2',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 0 },
        width: 100,
      },
      {
        id: 'field2',
        type: 'text',
        label: 'Field 2',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 100 },
        width: 100,
      },
    ];

    const result = validationService.detectCircularDependencies(fields);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(result).toContain('field1');
    expect(result).toContain('field2');
  });

  it('should detect indirect circular dependency (field1 -> field2 -> field3 -> field1)', () => {
    const fields: FieldDefinition[] = [
      {
        id: 'field1',
        type: 'text',
        label: 'Field 1',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field2',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 0 },
        width: 100,
      },
      {
        id: 'field2',
        type: 'text',
        label: 'Field 2',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field3',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 100 },
        width: 100,
      },
      {
        id: 'field3',
        type: 'text',
        label: 'Field 3',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 200 },
        width: 100,
      },
    ];

    const result = validationService.detectCircularDependencies(fields);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(3);
    expect(result).toContain('field1');
    expect(result).toContain('field2');
    expect(result).toContain('field3');
  });

  it('should detect self-referencing circular dependency', () => {
    const fields: FieldDefinition[] = [
      {
        id: 'field1',
        type: 'text',
        label: 'Field 1',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 0 },
        width: 100,
      },
    ];

    const result = validationService.detectCircularDependencies(fields);
    expect(result).not.toBeNull();
    expect(result).toContain('field1');
  });

  it('should handle complex dependency graph without cycles', () => {
    const fields: FieldDefinition[] = [
      {
        id: 'field1',
        type: 'text',
        label: 'Field 1',
        required: false,
        validation: [],
        conditionalLogic: [],
        position: { x: 0, y: 0 },
        width: 100,
      },
      {
        id: 'field2',
        type: 'text',
        label: 'Field 2',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 100 },
        width: 100,
      },
      {
        id: 'field3',
        type: 'text',
        label: 'Field 3',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
        ],
        position: { x: 0, y: 200 },
        width: 100,
      },
      {
        id: 'field4',
        type: 'text',
        label: 'Field 4',
        required: false,
        validation: [],
        conditionalLogic: [
          {
            fieldId: 'field2',
            operator: 'equals',
            value: 'show',
            action: 'show',
          },
          {
            fieldId: 'field3',
            operator: 'equals',
            value: 'show',
            action: 'show',
            logicOperator: 'OR',
          },
        ],
        position: { x: 0, y: 300 },
        width: 100,
      },
    ];

    const result = validationService.detectCircularDependencies(fields);
    expect(result).toBeNull();
  });
});
