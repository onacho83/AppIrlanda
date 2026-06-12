export interface InvoiceData {
  clientId: string;
  invoiceType: 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' | 'NOTA_CREDITO_A' | 'NOTA_CREDITO_B' | 'NOTA_CREDITO_C';
  netAmount: number;
  taxAmount: number;
  total: number;
  cuit: string; // CUIT del receptor si es responsable inscripto o monotributo
  associatedInvoice?: { cbteTipo: number; ptoVta: number; nro: number };
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
