import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { Client } from '../../../domain/entities/Client';
import { Order } from '../../../domain/entities/Order';
import { NotFoundError } from '../../../shared/errors/AppError';

/** Resultado del detalle de cliente con resumen de pedidos */
export interface ClientDetailResult {
  client: Client;
  orders: Order[];
  ordersSummary: {
    total: number;
    pending: number;
    completed: number;
  };
}

/**
 * Caso de uso: Obtener el detalle de un cliente con resumen de sus pedidos.
 */
export class GetClientDetailUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(id: string): Promise<ClientDetailResult> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError(`Cliente con ID ${id} no encontrado`);
    }

    const orders = await this.orderRepository.findByClient(id);

    // Calcular resumen de pedidos
    const pending = orders.filter(
      (o) => !['ENTREGADO', 'CANCELADO'].includes(o.status)
    ).length;
    const completed = orders.filter((o) => o.status === 'ENTREGADO').length;

    return {
      client,
      orders,
      ordersSummary: {
        total: orders.length,
        pending,
        completed,
      },
    };
  }
}
