// Estados posibles de un pedido en el flujo de trabajo
export enum OrderStatus {
  RECIBIDO = 'RECIBIDO',
  ESPERANDO_DISENO = 'ESPERANDO_DISENO',
  ESPERANDO_CONFIRMACION = 'ESPERANDO_CONFIRMACION',
  EN_PRODUCCION = 'EN_PRODUCCION',
  TERMINADO = 'TERMINADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

/**
 * Entidad de dominio que representa un pedido de la imprenta.
 * Contiene toda la información del trabajo solicitado, precios y estado.
 */
export class Order {
  constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public clientId: string,
    public createdBy: string,
    public productId: string,
    public productDescription: string,
    public quantity: number,
    public specifications: Record<string, unknown> | null,
    public unitPrice: number,
    public status: OrderStatus,
    public deliveryDate: Date | null,
    public notes: string | null,
    public designFileReference: string | null,
    public subtotal: number,
    public taxAmount: number,
    public total: number,
    public paidAmount: number,
    public chargedToAccount: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public invoiceId: string | null = null
  ) {}
}

/**
 * Registro del historial de cambio de estado de un pedido.
 * Permite auditar quién cambió el estado y cuándo.
 */
export class OrderStatusHistory {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly changedBy: string | null,
    public readonly fromStatus: OrderStatus,
    public readonly toStatus: OrderStatus,
    public readonly notes: string | null,
    public readonly createdAt: Date
  ) {}
}
