export enum AccountMovementType {
  CARGO = 'CARGO',
  PAGO = 'PAGO'
}

export class AccountMovement {
  constructor(
    public readonly id: string,
    public clientId: string,
    public orderId: string | null,
    public paymentId: string | null,
    public type: AccountMovementType,
    public amount: number,
    public balanceAfter: number,
    public description: string | null,
    public registeredBy: string | null,
    public readonly createdAt: Date
  ) {}
}
