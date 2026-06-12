import api from './api';
import type { Payment } from '../types';

export interface CreatePaymentInput {
  orderId?: string;
  clientId: string;
  amount: number;
  method: 'EFECTIVO' | 'TRANSFERENCIA';
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  method?: 'EFECTIVO' | 'TRANSFERENCIA';
  reference?: string;
  notes?: string;
}

export const paymentService = {
  createPayment: async (data: CreatePaymentInput): Promise<Payment> => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  getPayments: async (params?: {
    page?: number;
    limit?: number;
    clientId?: string;
    orderId?: string;
  }): Promise<{ data: Payment[]; total: number }> => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  updatePayment: async (id: string, data: UpdatePaymentInput): Promise<Payment> => {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },
};
