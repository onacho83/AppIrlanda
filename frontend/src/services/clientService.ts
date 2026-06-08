import api from './api';
import type { ClientListParams, CreateClientInput, UpdateClientInput, Client, PaginatedResponse, Order } from '../types';

export interface ClientDetailResult {
  client: Client;
  orders: Order[];
  ordersSummary: {
    total: number;
    pending: number;
    completed: number;
  };
}

/** Servicio de clientes — interacción con la API */
export const clientService = {
  /** Obtener listado paginado de clientes */
  getAll: async (params: ClientListParams) => {
    const res = await api.get<PaginatedResponse<Client>>('/clients', { params });
    return res.data;
  },

  /** Obtener un cliente por ID */
  getById: async (id: string) => {
    const res = await api.get<ClientDetailResult>(`/clients/${id}`);
    return res.data;
  },

  /** Buscar clientes por nombre, teléfono o email */
  search: async (q: string) => {
    const res = await api.get<Client[]>('/clients/search', { params: { q } });
    return res.data;
  },

  /** Crear un nuevo cliente */
  create: async (data: CreateClientInput) => {
    const res = await api.post<Client>('/clients', data);
    return res.data;
  },

  /** Actualizar un cliente existente */
  update: async (id: string, data: UpdateClientInput) => {
    const res = await api.put<Client>(`/clients/${id}`, data);
    return res.data;
  },

  /** Eliminar un cliente */
  delete: async (id: string) => {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
  },
};
