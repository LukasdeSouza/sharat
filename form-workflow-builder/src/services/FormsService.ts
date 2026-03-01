import api from './api';
import type { FormSchema } from '../types';

export const formsService = {
  async getAllForms(): Promise<FormSchema[]> {
    const response = await api.get('/forms');
    return response.data.map((f: any) => ({
      ...f,
      fields: f.schema?.fields || [],
      styling: f.schema?.styling || {
        theme: 'light',
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'system-ui',
      },
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    }));
  },

  async getForm(id: string): Promise<FormSchema> {
    const response = await api.get(`/forms/${id}`);
    const f = response.data;
    return {
      ...f,
      fields: f.schema?.fields || [],
      styling: f.schema?.styling || {
        theme: 'light',
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'system-ui',
      },
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    };
  },

  async createForm(
    form: Omit<FormSchema, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FormSchema> {
    const response = await api.post('/forms', {
      name: form.name,
      description: form.description,
      isPublished: form.isPublished,
      schema: {
        fields: form.fields,
        styling: form.styling,
      }
    });
    const f = response.data;
    return {
      ...f,
      fields: f.schema?.fields || [],
      styling: f.schema?.styling || {
        theme: 'light',
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'system-ui',
      },
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    };
  },

  async updateForm(
    id: string,
    updates: Partial<Omit<FormSchema, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FormSchema> {
    const response = await api.put(`/forms/${id}`, {
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.isPublished !== undefined && { isPublished: updates.isPublished }),
      ...((updates.fields || updates.styling) && {
        schema: {
          fields: updates.fields,
          styling: updates.styling,
        }
      }),
    });
    const f = response.data;
    return {
      ...f,
      fields: f.schema?.fields || [],
      styling: f.schema?.styling || {
        theme: 'light',
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'system-ui',
      },
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    };
  },

  async deleteForm(id: string): Promise<void> {
    await api.delete(`/forms/${id}`);
  },

  async getPublicForm(id: string): Promise<FormSchema> {
    const response = await api.get(`/public/form/${id}`);
    const f = response.data;
    return {
      ...f,
      fields: f.schema?.fields || [],
      styling: f.schema?.styling || {
        theme: 'light',
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        fontFamily: 'system-ui',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async submitPublicForm(formId: string, data: Record<string, any>): Promise<void> {
    await api.post(`/public/submit/${formId}`, { data });
  },
};
