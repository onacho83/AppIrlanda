import api from './api';
import type {
  OrderListParams,
  CreateOrderInput,
  UpdateOrderInput,
  UpdateStatusInput,
  Order,
  PaginatedResponse,
} from '../types';

/** Servicio de pedidos — interacción con la API */
export const orderService = {
  /** Obtener listado paginado de pedidos */
  getAll: async (params: OrderListParams) => {
    const res = await api.get<PaginatedResponse<Order>>('/orders', { params });
    return res.data;
  },

  /** Obtener un pedido por ID */
  getById: async (id: string) => {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  },

  /** Crear un nuevo pedido */
  create: async (data: CreateOrderInput) => {
    const res = await api.post<Order>('/orders', data);
    return res.data;
  },

  /** Actualizar un pedido existente */
  update: async (id: string, data: UpdateOrderInput) => {
    const res = await api.put<Order>(`/orders/${id}`, data);
    return res.data;
  },

  /** Cambiar el estado de un pedido */
  updateStatus: async (id: string, data: UpdateStatusInput) => {
    const res = await api.patch<Order>(`/orders/${id}/status`, data);
    return res.data;
  },
};
