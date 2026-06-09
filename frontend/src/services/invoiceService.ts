import api from './api';
import type { Invoice } from '../types';

export const invoiceService = {
  generateInvoice: async (clientId: string, orderIds: string[]): Promise<Invoice> => {
    const response = await api.post('/invoices', { clientId, orderIds });
    return response.data.data;
  },

  getInvoices: async (filters?: { clientId?: string, page?: number, limit?: number }) => {
    const response = await api.get('/invoices', { params: filters });
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  }
};
