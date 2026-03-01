import type { WorkflowStep, WorkflowConnection } from '../types';

export class WorkflowValidationService {
  /**
   * Detects orphaned steps in a workflow
   * A step is orphaned if it has no incoming or outgoing connections
   * (except for start and end steps which are allowed to have only one direction)
   */
  detectOrphanedSteps(
    steps: WorkflowStep[],
    connections: WorkflowConnection[]
  ): string[] {
    if (steps.length === 0) {
      return [];
    }

    const orphanedSteps: string[] = [];

    for (const step of steps) {
      const hasIncoming = connections.some(conn => conn.toStepId === step.id);
      const hasOutgoing = connections.some(conn => conn.fromStepId === step.id);

      // A step is orphaned if it has no connections at all
      // For a more lenient check, we could allow start steps (no incoming) 
      // and end steps (no outgoing), but the requirement says "no connections except start/end"
      // We'll consider a step orphaned if it has neither incoming nor outgoing
      if (!hasIncoming && !hasOutgoing && steps.length > 1) {
        orphanedSteps.push(step.id);
      }
    }

    return orphanedSteps;
  }

  /**
   * Validates the entire workflow structure
   * Returns an array of error messages
   */
  validateWorkflow(
    steps: WorkflowStep[],
    connections: WorkflowConnection[]
  ): string[] {
    const errors: string[] = [];

    // Check for orphaned steps
    const orphanedSteps = this.detectOrphanedSteps(steps, connections);
    if (orphanedSteps.length > 0) {
      const stepNames = orphanedSteps
        .map(stepId => {
          const step = steps.find(s => s.id === stepId);
          return step ? step.name : stepId;
        })
        .join(', ');
      
      errors.push(
        `Orphaned steps detected: ${stepNames}. All steps must be connected to the workflow.`
      );
    }

    // Check for invalid connections (connections referencing non-existent steps)
    for (const connection of connections) {
      const fromStepExists = steps.some(s => s.id === connection.fromStepId);
      const toStepExists = steps.some(s => s.id === connection.toStepId);

      if (!fromStepExists) {
        errors.push(`Invalid connection: source step ${connection.fromStepId} does not exist`);
      }
      if (!toStepExists) {
        errors.push(`Invalid connection: target step ${connection.toStepId} does not exist`);
      }
    }

    return errors;
  }

  /**
   * Checks if a workflow is valid (no errors)
   */
  isWorkflowValid(
    steps: WorkflowStep[],
    connections: WorkflowConnection[]
  ): boolean {
    const errors = this.validateWorkflow(steps, connections);
    return errors.length === 0;
  }
}

// Export a singleton instance
export const workflowValidationService = new WorkflowValidationService();
