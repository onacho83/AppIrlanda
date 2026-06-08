// Condiciones de IVA para clientes argentinos
export enum IvaCondition {
  RESPONSABLE_INSCRIPTO = 'RESPONSABLE_INSCRIPTO',
  MONOTRIBUTISTA = 'MONOTRIBUTISTA',
  CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL',
  EXENTO = 'EXENTO',
}

/**
 * Entidad de dominio que representa un cliente de la imprenta.
 * Contiene datos personales, fiscales y configuración de cuenta corriente.
 */
export class Client {
  constructor(
    public readonly id: string,
    public name: string,
    public phone: string | null,
    public email: string | null,
    public address: string | null,
    public cuit: string | null,
    public fiscalName: string | null,
    public ivaCondition: IvaCondition,
    public hasCurrentAccount: boolean,
    public creditLimit: number | null,
    public readonly trackingToken: string,
    public notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
