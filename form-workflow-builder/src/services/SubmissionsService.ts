import api from './api';

export interface FormSubmission {
  id: string;
  data: Record<string, any>;
  workflowStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  submittedAt: string;
  updatedAt: string;
  formId: string;
  execution?: {
    id: string;
    status: string;
    workflow?: {
      name: string;
    };
  };
}

export interface SubmissionsResponse {
  data: FormSubmission[];
  total: number;
  limit: number;
  offset: number;
}

export const submissionsService = {
  async getSubmissionsByForm(
    formId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SubmissionsResponse> {
    const response = await api.get(`/submissions/form/${formId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  async getSubmission(id: string): Promise<FormSubmission> {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  async createSubmission(
    formId: string,
    data: Record<string, any>
  ): Promise<FormSubmission> {
    const response = await api.post('/submissions', {
      form_id: formId,
      data,
    });
    return response.data;
  },

  async updateSubmissionStatus(
    id: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  ): Promise<FormSubmission> {
    const response = await api.put(`/submissions/${id}/status`, {
      workflow_status: status,
    });
    return response.data;
  },

  async deleteSubmission(id: string): Promise<void> {
    await api.delete(`/submissions/${id}`);
  },
};
