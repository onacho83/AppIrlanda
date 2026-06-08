import api from './api';
import type { Quote, CreateQuoteInput, PaginatedResponse } from '../types';

export const quoteService = {
  getQuotes: async (params?: {
    page?: number;
    limit?: number;
    clientId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Quote>> => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },

  getQuoteById: async (id: string): Promise<Quote> => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
  },

  createQuote: async (data: CreateQuoteInput): Promise<Quote> => {
    const response = await api.post('/quotes', data);
    return response.data;
  },

  convertToOrder: async (id: string): Promise<void> => {
    await api.post(`/quotes/${id}/convert`);
  },
};
