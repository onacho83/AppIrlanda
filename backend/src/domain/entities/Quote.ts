export enum QuoteStatus {
  PENDIENTE = 'PENDIENTE',
  ACEPTADO = 'ACEPTADO',
  RECHAZADO = 'RECHAZADO',
  VENCIDO = 'VENCIDO',
}

export class QuoteItem {
  constructor(
    public readonly id: string,
    public readonly quoteId: string,
    public productId: string,
    public description: string | null,
    public quantity: number,
    public specifications: Record<string, unknown> | null,
    public unitPrice: number,
    public subtotal: number
  ) {}
}

export class Quote {
  constructor(
    public readonly id: string,
    public readonly quoteNumber: string,
    public clientId: string,
    public createdBy: string,
    public status: QuoteStatus,
    public validUntil: Date | null,
    public notes: string | null,
    public subtotal: number,
    public taxAmount: number,
    public total: number,
    public convertedOrderId: string | null,
    public readonly createdAt: Date,
    public items?: QuoteItem[]
  ) {}
}
