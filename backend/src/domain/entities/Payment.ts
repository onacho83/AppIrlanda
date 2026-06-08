export enum PaymentMethod {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA'
}

export class Payment {
  constructor(
    public readonly id: string,
    public orderId: string | null,
    public clientId: string,
    public registeredBy: string | null,
    public amount: number,
    public method: PaymentMethod,
    public reference: string | null,
    public notes: string | null,
    public readonly createdAt: Date
  ) {}
}
