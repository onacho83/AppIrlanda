import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { Order } from '../../../domain/entities/Order';
import { OrderFiltersInput } from '../../dtos/orders/OrderDTO';

/** Resultado paginado de la lista de pedidos */
export interface ListOrdersResult {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Caso de uso: Listar pedidos con paginación y filtros.
 * Permite filtrar por estado, cliente y rango de fechas.
 */
export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(filters: OrderFiltersInput): Promise<ListOrdersResult> {
    const { data, total } = await this.orderRepository.findAll({
      page: filters.page,
      limit: filters.limit,
      status: filters.status,
      clientId: filters.clientId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
    };
  }
}
