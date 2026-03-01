import api from './api';
import type { WorkflowDefinition } from '../types';

export const workflowsService = {
  async getWorkflowsByForm(formId: string): Promise<WorkflowDefinition[]> {
    const response = await api.get(`/workflows/form/${formId}`);
    return response.data.map((w: any) => ({
      ...w,
      steps: w.definition.steps || [],
      connections: w.definition.connections || [],
    }));
  },

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    const response = await api.get(`/workflows/${id}`);
    const w = response.data;
    return {
      ...w,
      steps: w.definition.steps || [],
      connections: w.definition.connections || [],
    };
  },

  async createWorkflow(
    workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkflowDefinition> {
    const response = await api.post('/workflows', {
      form_id: workflow.formId,
      name: workflow.name,
      definition: {
        steps: workflow.steps,
        connections: workflow.connections,
      },
    });
    const w = response.data;
    return {
      ...w,
      steps: w.definition.steps || [],
      connections: w.definition.connections || [],
    };
  },

  async updateWorkflow(
    id: string,
    updates: Partial<Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<WorkflowDefinition> {
    const response = await api.put(`/workflows/${id}`, {
      ...(updates.name && { name: updates.name }),
      ...((updates.steps || updates.connections) && {
        definition: {
          steps: updates.steps,
          connections: updates.connections,
        }
      }),
    });
    const w = response.data;
    return {
      ...w,
      steps: w.definition.steps || [],
      connections: w.definition.connections || [],
    };
  },

  async getAllWorkflows(): Promise<WorkflowDefinition[]> {
    const response = await api.get('/workflows');
    return response.data.map((w: any) => ({
      ...w,
      steps: w.definition.steps || [],
      connections: w.definition.connections || [],
    }));
  },

  async deleteWorkflow(id: string): Promise<void> {
    await api.delete(`/workflows/${id}`);
  },
};
