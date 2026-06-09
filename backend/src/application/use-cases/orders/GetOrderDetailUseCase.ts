import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { OrderResponseDTO } from '../../dtos/orders/OrderDTO';

/**
 * Caso de uso: Obtener el detalle completo de un pedido.
 * Incluye datos del cliente, producto e historial de estados.
 * Retorna un DTO enriquecido con relaciones.
 *
 * Nota: Este caso de uso depende de que el repositorio incluya
 * las relaciones al buscar por ID (client, product, statusHistory).
 * El DTO de respuesta se construye en la ruta.
 */
export class GetOrderDetailUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<OrderResponseDTO> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError(`Pedido con ID ${id} no encontrado`);
    }

    // Retornar el pedido serializado como DTO de respuesta
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      clientId: order.clientId,
      createdBy: order.createdBy,
      productId: order.productId,
      productDescription: order.productDescription,
      quantity: order.quantity,
      specifications: order.specifications,
      unitPrice: order.unitPrice,
      status: order.status,
      deliveryDate: order.deliveryDate?.toISOString() ?? null,
      notes: order.notes,
      designFileReference: order.designFileReference,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      total: order.total,
      paidAmount: order.paidAmount,
      chargedToAccount: order.chargedToAccount,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      invoiceId: order.invoiceId,
    };
  }
}
