import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { OrderStateMachine } from '../../../domain/services/OrderStateMachine';
import { UpdateOrderStatusInput } from '../../dtos/orders/OrderDTO';
import { NotFoundError } from '../../../shared/errors/AppError';

/**
 * Caso de uso: Actualizar el estado de un pedido.
 * - Valida la transición usando la máquina de estados
 * - Registra el cambio en el historial de estados
 */
export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(
    orderId: string,
    input: UpdateOrderStatusInput,
    changedBy: string
  ): Promise<Order> {
    // Verificar que el pedido existe
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError(`Pedido con ID ${orderId} no encontrado`);
    }

    const fromStatus = order.status;
    const toStatus = input.status as OrderStatus;

    // Validar la transición de estado con la máquina de estados
    OrderStateMachine.validateTransition(fromStatus, toStatus);

    // Actualizar el estado del pedido
    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      toStatus,
      changedBy,
      input.notes ?? undefined
    );

    // Registrar en el historial de estados
    await this.orderRepository.addStatusHistory({
      orderId,
      changedBy,
      fromStatus,
      toStatus,
      notes: input.notes ?? null,
    });

    return updatedOrder;
  }
}
