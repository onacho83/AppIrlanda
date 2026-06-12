import { InvoiceType } from '@prisma/client';

export class Invoice {
  constructor(
    public readonly id: string,
    public clientId: string,
    public createdBy: string,
    public invoiceType: InvoiceType,
    public salePoint: number,
    public invoiceNumber: string,
    public cae: string | null,
    public caeExpiration: Date | null,
    public netAmount: number,
    public taxAmount: number,
    public total: number,
    public qrData: string | null,
    public arcaRequest: any | null,
    public arcaResponse: any | null,
    public originalInvoiceId: string | null,
    public readonly createdAt: Date
  ) {}
}
