import api from './api';

export interface TenantStats {
  users: number;
  forms: number;
  workflows: number;
  submissions: number;
  submissionsByDay: { date: string; count: number }[];
  submissionsByForm: { formId: string; formName: string; count: number }[];
}

export const statsService = {
  async getStats(days: number = 14): Promise<TenantStats> {
    const response = await api.get<TenantStats>('/stats', { params: { days } });
    return response.data;
  },
};
