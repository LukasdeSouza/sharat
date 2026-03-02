// Form Builder Types
export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'dropdown'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'textarea';

export type ValidationType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'minValue'
  | 'maxValue'
  | 'pattern'
  | 'email';

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

export interface FieldOption {
  id: string;
  value: string;
  label: string;
}

export interface ConditionalRule {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide';
  logicOperator?: 'AND' | 'OR';
}

export interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  required: boolean;
  validation: ValidationRule[];
  conditionalLogic?: ConditionalRule[];
  position: { x: number; y: number };
  width: number;
  options?: FieldOption[];
  accept?: string;
}

export interface FormStyling {
  theme: 'light' | 'dark';
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

export interface FormSchema {
  id: string;
  name: string;
  description: string;
  fields: FieldDefinition[];
  isPublished: boolean;
  styling: FormStyling;
  createdAt: Date;
  updatedAt: Date;
  workflowId?: string;
}

// Workflow Types
export type StepType =
  | 'approval'
  | 'notification'
  | 'transform'
  | 'condition'
  | 'action'
  | 'webhook';

export interface DataTransformation {
  field: string;
  operation: 'map' | 'filter' | 'format';
  expression: string;
}

export interface StepConfig {
  // Approval step
  approverEmail?: string;
  approvalTimeout?: number;

  // Notification step
  recipients?: string[];
  template?: string;

  // Transform step
  transformations?: DataTransformation[];

  // Condition step
  condition?: string;
  truePath?: string;
  falsePath?: string;

  // Webhook step
  url?: string;
  value?: string;
  method?: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;

  approverId?: string;
  fieldId?: string;
  operator?:string;
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  config: StepConfig;
  position: { x: number; y: number };
}

export interface WorkflowConnection {
  id: string;
  fromStepId: string;
  toStepId: string;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  formId: string;
  name: string;
  steps: WorkflowStep[];
  connections: WorkflowConnection[];
  createdAt: Date;
  updatedAt: Date;
}

// Submission Types
export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedBy?: string;
  createdAt?: Date;
  submittedAt: Date;
  workflowId?: string;
}

// User Types
export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER' | 'APPROVER';

export interface User {
  id: string;
  email: string;
  company_id: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
