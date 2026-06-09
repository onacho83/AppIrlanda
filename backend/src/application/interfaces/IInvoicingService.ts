export interface InvoiceData {
  clientId: string;
  invoiceType: 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C';
  netAmount: number;
  taxAmount: number;
  total: number;
  cuit: string; // CUIT del receptor si es responsable inscripto o monotributo
}

export interface InvoiceResult {
  cae: string;
  caeExpiration: Date;
  invoiceNumber: string;
  salePoint: number;
  qrData: string;
  arcaRequest: any;
  arcaResponse: any;
}

export interface IInvoicingService {
  generateInvoice(data: InvoiceData): Promise<InvoiceResult>;
}
