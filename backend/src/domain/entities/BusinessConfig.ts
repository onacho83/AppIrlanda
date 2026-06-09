export class BusinessConfig {
  constructor(
    public readonly id: string,
    public businessName: string,
    public cuit: string | null,
    public ivaCondition: string | null,
    public address: string | null,
    public phone: string | null,
    public email: string | null,
    public logoPath: string | null,
    public arcaSalePoint: number | null,
    public arcaCert: string | null,
    public arcaKey: string | null,
    public arcaProduction: boolean,
    public grossIncome: string | null,
    public activityStartDate: string | null,
    public readonly updatedAt: Date
  ) {}
}
