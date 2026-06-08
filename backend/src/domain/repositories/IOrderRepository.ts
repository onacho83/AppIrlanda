import { Order } from '../entities/Order';

/** Filtros para listar pedidos con paginación */
export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Datos necesarios para crear un nuevo pedido */
export interface CreateOrderDTO {
  orderNumber: string;
  clientId: string;
  createdBy: string;
  productId: string;
  productDescription: string;
  quantity: number;
  specifications?: Record<string, unknown> | null;
  unitPrice: number;
  deliveryDate?: Date | null;
  notes?: string | null;
  designFileReference?: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  chargedToAccount?: boolean;
}

/** Datos opcionales para actualizar un pedido existente */
export interface UpdateOrderDTO {
  productDescription?: string;
  quantity?: number;
  specifications?: Record<string, unknown> | null;
  unitPrice?: number;
  deliveryDate?: Date | null;
  notes?: string | null;
  designFileReference?: string | null;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  paidAmount?: number;
}

/** Datos para registrar una entrada en el historial de estados */
export interface StatusHistoryDTO {
  orderId: string;
  changedBy: string;
  fromStatus: string;
  toStatus: string;
  notes?: string | null;
}

/**
 * Contrato del repositorio de pedidos.
 * Define las operaciones de persistencia para Order y su historial de estados.
 */
export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(filters?: OrderFilters): Promise<{ data: Order[]; total: number }>;
  findByClient(clientId: string): Promise<Order[]>;
  create(order: CreateOrderDTO): Promise<Order>;
  update(id: string, data: UpdateOrderDTO): Promise<Order>;
  updateStatus(id: string, status: string, changedBy: string, notes?: string): Promise<Order>;
  getNextOrderNumber(): Promise<string>;
  addStatusHistory(data: StatusHistoryDTO): Promise<void>;
}
