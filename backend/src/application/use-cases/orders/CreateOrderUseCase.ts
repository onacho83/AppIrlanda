import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { CreateOrderInput } from '../../dtos/orders/OrderDTO';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

/**
 * Caso de uso: Crear un nuevo pedido.
 * - Genera orderNumber con formato IMP-YYMMDD-XXXX
 * - Calcula subtotal y total
 * - Registra historial de estado inicial
 * - Opcionalmente carga a cuenta corriente del cliente
 */
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly clientRepository: IClientRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: CreateOrderInput, createdBy: string): Promise<Order> {
    // Verificar que el cliente existe
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw new NotFoundError(`Cliente con ID ${input.clientId} no encontrado`);
    }

    // Verificar que el producto existe
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundError(`Producto con ID ${input.productId} no encontrado`);
    }

    // Validar cuenta corriente si se quiere cargar a cuenta
    if (input.chargedToAccount && !client.hasCurrentAccount) {
      throw new ValidationError(
        'El cliente no tiene cuenta corriente habilitada'
      );
    }

    // Calcular totales
    const subtotal = input.unitPrice * input.quantity;
    const taxAmount = 0; // Por ahora sin IVA, se agrega con facturación
    const total = subtotal + taxAmount;

    // Generar número de pedido secuencial del día
    const orderNumber = await this.orderRepository.getNextOrderNumber();

    // Parsear fecha de entrega si se proporcionó
    let deliveryDate: Date | null = null;
    if (input.deliveryDate) {
      deliveryDate = new Date(input.deliveryDate);
    }

    // Crear el pedido
    const order = await this.orderRepository.create({
      orderNumber,
      clientId: input.clientId,
      createdBy,
      productId: input.productId,
      productDescription: input.productDescription,
      quantity: input.quantity,
      specifications: input.specifications ?? null,
      unitPrice: input.unitPrice,
      deliveryDate,
      notes: input.notes ?? null,
      designFileReference: input.designFileReference ?? null,
      subtotal,
      taxAmount,
      total,
      chargedToAccount: input.chargedToAccount,
    });

    // Registrar estado inicial en el historial
    await this.orderRepository.addStatusHistory({
      orderId: order.id,
      changedBy: createdBy,
      fromStatus: OrderStatus.RECIBIDO,
      toStatus: OrderStatus.RECIBIDO,
      notes: 'Pedido creado',
    });

    return order;
  }
}
