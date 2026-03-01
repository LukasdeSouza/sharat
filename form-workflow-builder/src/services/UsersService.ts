import api from './api';
import type { User, Role } from '../types';

export interface CreateUserData {
    email: string;
    password?: string;
    role: Role | string;
}

export const usersService = {
    getUsers: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    createUser: async (userData: CreateUserData): Promise<User> => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};
