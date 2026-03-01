# Implementation Plan: Form Workflow Builder (Frontend Only)

## Overview

This implementation plan focuses on building a frontend-only form creator and workflow designer using React, TypeScript, and localStorage. The approach prioritizes getting a working demo ready quickly by building core functionality first, then adding polish. Perfect for a Monday presentation!

## Tasks

- [x] 1. Set up project foundation
  - Initialize Vite + React + TypeScript project
  - Install dependencies: TailwindCSS, React DnD, Zod, fast-check (for testing)
  - Configure TailwindCSS with a minimal, modern theme
  - Set up basic routing (React Router) for: Home, Form Builder, Workflow Designer, Form Preview, Submissions
  - Create basic layout component with navigation
  - _Requirements: 7.1, 7.2_

- [x] 2. Implement localStorage service
  - [x] 2.1 Create LocalStorageService class
    - Implement methods for saving/loading forms, workflows, and submissions
    - Add error handling for quota exceeded
    - Add utility methods for export/import and storage usage
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ]* 2.2 Write property test for form persistence round-trip
    - **Property 2: Form persistence round-trip**
    - **Validates: Requirements 1.5, 9.2**

  - [ ]* 2.3 Write property test for submission retrieval
    - **Property 16: Submission retrieval**
    - **Validates: Requirements 5.3, 9.2**

  - [ ]* 2.4 Write property test for localStorage persistence
    - **Property 21: LocalStorage persistence**
    - **Validates: Requirements 9.4**

- [ ] 3. Implement validation service
  - [x] 3.1 Create ValidationService class
    - Implement validateField for each validation rule type
    - Implement validateSubmission to validate all fields
    - Implement evaluateConditionalLogic for show/hide rules
    - _Requirements: 2.2, 2.4, 3.2_

  - [ ]* 3.2 Write property test for validation rejection
    - **Property 4: Validation rejection on failure**
    - **Validates: Requirements 2.2, 2.4**

  - [ ]* 3.3 Write property test for validation error messages
    - **Property 5: Validation error messages**
    - **Validates: Requirements 2.3**

  - [ ]* 3.4 Write property test for conditional logic evaluation
    - **Property 7: Conditional logic evaluation**
    - **Validates: Requirements 3.2**

  - [ ]* 3.5 Write property test for hidden field exclusion
    - **Property 8: Hidden field exclusion**
    - **Validates: Requirements 3.3**

- [x] 4. Create reusable field components
  - [x] 4.1 Implement base field components
    - Create components for: TextInput, NumberInput, EmailInput, DatePicker, TextArea
    - Create components for: Dropdown, MultiSelect, Checkbox, Radio
    - Each component should accept: value, onChange, label, placeholder, error, required
    - Style with TailwindCSS for minimal, modern look
    - _Requirements: 1.3, 7.1, 7.2_

  - [ ]* 4.2 Write property test for field type support
    - **Property 1: Field type support**
    - **Validates: Requirements 1.3**

  - [x] 4.3 Add validation feedback to field components
    - Display error messages below fields
    - Add visual indicators for required fields
    - Add focus states and hover effects
    - _Requirements: 2.3, 7.4_

- [x] 5. Build form builder UI
  - [x] 5.1 Create field library sidebar
    - Display all available field types as draggable items
    - Use icons and labels for each field type
    - _Requirements: 1.1, 7.5_

  - [x] 5.2 Create drag-and-drop canvas
    - Implement drop zone for adding fields using React DnD
    - Display dropped fields in a vertical list (simplified layout)
    - Allow reordering fields by dragging
    - _Requirements: 1.1_

  - [x] 5.3 Create field configuration panel
    - Show panel when a field is selected
    - Allow editing: label, placeholder, default value, required
    - Add section for validation rules with add/remove buttons
    - Add section for conditional logic rules
    - _Requirements: 1.2, 2.1, 3.1_

  - [x] 5.4 Implement form metadata editor
    - Add form name and description inputs at top
    - Add save button that persists to localStorage
    - Show success message on save
    - _Requirements: 1.5_

- [ ] 6. Implement circular dependency detection
  - [ ] 6.1 Create function to detect circular dependencies
    - Implement graph traversal to detect cycles in conditional logic
    - Show error message if circular dependency detected
    - Prevent form save until resolved
    - _Requirements: 3.5_

  - [ ]* 6.2 Write property test for circular dependency detection
    - **Property 10: Circular dependency detection**
    - **Validates: Requirements 3.5**

- [x] 7. Checkpoint - Test form builder
  - Create a test form with various field types
  - Add validation rules and conditional logic
  - Save and reload to verify persistence
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build form preview/renderer
  - [x] 8.1 Create FormRenderer component
    - Load form schema from localStorage by ID
    - Render all visible fields based on conditional logic
    - Evaluate conditional logic in real-time as user types
    - Apply validation on blur and on submit
    - _Requirements: 1.4, 3.2, 8.2, 8.3_

  - [ ]* 8.2 Write property test for rendering mode selection
    - **Property 20: Rendering mode selection**
    - **Validates: Requirements 8.2**

  - [x] 8.3 Implement form submission
    - Validate all fields on submit
    - Show validation errors if any
    - If valid, save submission to localStorage
    - Show success message and clear form
    - _Requirements: 2.2, 2.4, 5.1_

  - [ ]* 8.4 Write property test for submission storage
    - **Property 15: Submission storage**
    - **Validates: Requirements 5.1, 5.2**

- [-] 9. Build workflow designer UI
  - [x] 9.1 Create workflow step library
    - Display step types: Approval, Notification, Transform, Condition, Webhook
    - Make steps draggable to canvas
    - _Requirements: 4.2_

  - [ ]* 9.2 Write property test for workflow step type support
    - **Property 11: Workflow step type support**
    - **Validates: Requirements 4.2**

  - [x] 9.3 Create workflow canvas
    - Implement drop zone for workflow steps
    - Display steps as cards/nodes with visual styling
    - Allow connecting steps by drawing lines (simplified: click source then target)
    - _Requirements: 4.1, 4.4_

  - [ ]* 9.4 Write property test for workflow connection support
    - **Property 13: Workflow connection support**
    - **Validates: Requirements 4.4**

  - [x] 9.5 Create step configuration panel
    - Show panel when step is selected
    - Display step-specific configuration fields based on step type
    - For Approval: approver email, timeout
    - For Notification: recipients, template
    - For Condition: condition expression, true/false paths
    - For Webhook: URL, method, headers
    - _Requirements: 4.3_

  - [ ]* 9.6 Write property test for workflow step configuration
    - **Property 12: Workflow step configuration**
    - **Validates: Requirements 4.3**

  - [x] 9.7 Implement workflow validation
    - Detect orphaned steps (no connections except start/end)
    - Show error message if validation fails
    - Prevent save until resolved
    - _Requirements: 4.5_

  - [ ]* 9.8 Write property test for orphaned step detection
    - **Property 14: Orphaned step detection**
    - **Validates: Requirements 4.5**

  - [x] 9.9 Implement workflow save/load
    - Save workflow to localStorage associated with form ID
    - Load workflow when editing
    - _Requirements: 4.1, 9.1_

- [x] 10. Build submissions management UI
  - [x] 10.1 Create submissions list view
    - Load all submissions for selected form from localStorage
    - Display in table format with columns for each field
    - Show timestamp and submitter (if available)
    - Show associated workflow name if exists
    - _Requirements: 6.2, 6.4_

  - [ ]* 10.2 Write property test for workflow association
    - **Property 18: Workflow association**
    - **Validates: Requirements 6.4**

  - [x] 10.3 Implement filtering
    - Add filter inputs for date range
    - Add search input for field values
    - Filter submissions in real-time
    - _Requirements: 6.3_

  - [ ]* 10.4 Write property test for submission filtering
    - **Property 17: Submission filtering**
    - **Validates: Requirements 6.3**

  - [x] 10.5 Implement export functionality
    - Add "Export to JSON" button
    - Generate JSON file with all submissions
    - Trigger download
    - _Requirements: 6.5_

  - [ ]* 10.6 Write property test for submission export round-trip
    - **Property 19: Submission export round-trip**
    - **Validates: Requirements 6.5**

- [x] 11. Build home/dashboard page
  - [x] 11.1 Create forms list
    - Display all saved forms from localStorage
    - Show form name, description, created date
    - Add buttons: Edit, Preview, View Submissions, Delete
    - Add "Create New Form" button
    - _Requirements: 1.5_

  - [x] 11.2 Add workflow indicators
    - Show icon/badge if form has associated workflow
    - Allow clicking to edit workflow
    - _Requirements: 4.1_

- [x] 12. Polish UI and add final touches
  - [x] 12.1 Improve visual design
    - Ensure consistent spacing and typography
    - Add subtle shadows and borders for depth
    - Use a cohesive color palette (minimal, modern)
    - Add smooth transitions for interactions
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 12.2 Add loading states and feedback
    - Show loading indicators for localStorage operations
    - Add success/error toast notifications
    - Add confirmation dialogs for delete actions
    - _Requirements: 7.4_

  - [x] 12.3 Implement responsive design
    - Ensure layouts work on desktop and tablet
    - Use responsive grid and flexbox
    - Test on different screen sizes
    - _Requirements: 7.3_

  - [x] 12.4 Add helpful empty states
    - Show friendly messages when no forms exist
    - Show instructions for getting started
    - Add example/template forms option
    - _Requirements: 7.5_

  - [x] 12.5 Handle storage quota errors
    - Detect when localStorage is full
    - Show clear error message with suggestions
    - Provide option to export and clear old data
    - _Requirements: 9.5_

  - [ ]* 12.6 Write property test for storage quota handling
    - **Property 22: Storage quota handling**
    - **Validates: Requirements 9.5**

- [ ] 13. Final checkpoint - Integration testing
  - [ ]* 13.1 Test complete form creation flow
    - Create form → add fields → configure validation → save → reload → verify persistence
    - _Requirements: 1.1, 1.2, 1.5, 2.1_

  - [ ]* 13.2 Test complete form submission flow
    - Preview form → fill fields → validate → submit → view in submissions list
    - _Requirements: 2.2, 5.1, 6.2_

  - [ ]* 13.3 Test complete workflow design flow
    - Create workflow → add steps → connect → configure → save → reload → verify
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Focus on getting core functionality working first, then polish
- Use TailwindCSS utility classes for quick styling
- Keep the UI simple and intuitive - this is a demo, not production
- LocalStorage has ~5-10MB limit - sufficient for demo purposes
- Workflow designer is visual only (no execution) - perfect for presentations
- Property tests use fast-check with minimum 100 iterations per test
