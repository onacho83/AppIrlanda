import { IQuoteRepository } from '../../../domain/repositories/IQuoteRepository';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { QuoteStatus } from '../../../domain/entities/Quote';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class ConvertQuoteToOrderUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(quoteId: string, createdBy: string): Promise<Order[]> {
    const quote = await this.quoteRepository.findById(quoteId);
    if (!quote) {
      throw new NotFoundError(`Presupuesto con ID ${quoteId} no encontrado`);
    }

    if (quote.status === QuoteStatus.ACEPTADO) {
      throw new ValidationError('El presupuesto ya ha sido aceptado y convertido en pedido(s)');
    }

    if (!quote.items || quote.items.length === 0) {
      throw new ValidationError('El presupuesto no tiene ítems para convertir');
    }

    const createdOrders: Order[] = [];

    for (const item of quote.items) {
      const orderNumber = await this.orderRepository.getNextOrderNumber();
      
      const taxAmount = item.subtotal * 0.21;
      const total = item.subtotal + taxAmount;

      const order = await this.orderRepository.create({
        orderNumber,
        clientId: quote.clientId,
        createdBy,
        productId: item.productId,
        productDescription: item.description || 'Producto de presupuesto',
        quantity: item.quantity,
        specifications: item.specifications,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        taxAmount,
        total,
        chargedToAccount: false,
      });

      await this.orderRepository.addStatusHistory({
        orderId: order.id,
        changedBy: createdBy,
        fromStatus: OrderStatus.RECIBIDO,
        toStatus: OrderStatus.RECIBIDO,
        notes: `Pedido creado a partir del presupuesto ${quote.quoteNumber}`,
      });

      createdOrders.push(order);
    }

    // Actualizar estado del presupuesto. 
    // Guardamos el ID del primer pedido por compatibilidad con el modelo de datos (converted_order_id)
    await this.quoteRepository.update(quoteId, {
      status: QuoteStatus.ACEPTADO,
      convertedOrderId: createdOrders.length > 0 ? createdOrders[0].id : null,
    });

    return createdOrders;
  }
}
