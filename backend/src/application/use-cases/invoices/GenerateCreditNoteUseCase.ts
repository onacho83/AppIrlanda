import { IInvoiceRepository } from '../../../domain/repositories/IInvoiceRepository';
import { IInvoicingService } from '../../interfaces/IInvoicingService';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/errors/AppError';

export class GenerateCreditNoteUseCase {
  constructor(
    private invoiceRepo: IInvoiceRepository,
    private invoicingService: IInvoicingService,
    private prisma: PrismaClient
  ) {}

  async execute(originalInvoiceId: string, userId: string) {
    const originalInvoice = await this.invoiceRepo.findById(originalInvoiceId);
    if (!originalInvoice) {
      throw new AppError('Factura original no encontrada', 404);
    }

    if (originalInvoice.invoiceType.includes('NOTA_CREDITO')) {
      throw new AppError('No se puede generar una nota de crédito sobre otra nota de crédito', 400);
    }

    // Verificar si ya existe una nota de crédito para esta factura
    const existingCreditNote = await this.prisma.invoice.findFirst({
      where: { original_invoice_id: originalInvoiceId }
    });

    if (existingCreditNote) {
      throw new AppError('Esta factura ya posee una Nota de Crédito generada', 400);
    }

    const client = await this.prisma.client.findUnique({ where: { id: originalInvoice.clientId } });
    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    let creditNoteType: 'NOTA_CREDITO_A' | 'NOTA_CREDITO_B' | 'NOTA_CREDITO_C';
    if (originalInvoice.invoiceType === 'FACTURA_A') creditNoteType = 'NOTA_CREDITO_A';
    else if (originalInvoice.invoiceType === 'FACTURA_B') creditNoteType = 'NOTA_CREDITO_B';
    else creditNoteType = 'NOTA_CREDITO_C';

    const cuit = client.cuit ? client.cuit.replace(/[^0-9]/g, '') : '';

    // Mapear el tipo de comprobante original para AFIP (1=A, 6=B, 11=C)
    let originalCbteTipo = 11;
    if (originalInvoice.invoiceType === 'FACTURA_A') originalCbteTipo = 1;
    else if (originalInvoice.invoiceType === 'FACTURA_B') originalCbteTipo = 6;

    const afipRes = await this.invoicingService.generateInvoice({
      clientId: client.id,
      invoiceType: creditNoteType,
      netAmount: originalInvoice.netAmount,
      taxAmount: originalInvoice.taxAmount,
      total: originalInvoice.total,
      cuit: cuit,
      associatedInvoice: {
        cbteTipo: originalCbteTipo,
        ptoVta: originalInvoice.salePoint,
        nro: Number(originalInvoice.invoiceNumber.split('-')[1])
      }
    });

    // Obtener los orderIds de la factura original para enlazarlos también a la nota de crédito
    const originalInvoiceOrders = await this.prisma.order.findMany({
      where: { invoice_id: originalInvoiceId }
    });
    const orderIds = originalInvoiceOrders.map(o => o.id);

    const creditNote = await this.invoiceRepo.create({
      clientId: client.id,
      createdBy: userId,
      invoiceType: creditNoteType,
      salePoint: afipRes.salePoint,
      invoiceNumber: afipRes.invoiceNumber,
      cae: afipRes.cae,
      caeExpiration: afipRes.caeExpiration,
      netAmount: originalInvoice.netAmount,
      taxAmount: originalInvoice.taxAmount,
      total: originalInvoice.total,
      qrData: afipRes.qrData,
      arcaRequest: afipRes.arcaRequest,
      arcaResponse: afipRes.arcaResponse,
      originalInvoiceId: originalInvoice.id
    }, orderIds);

    // Cambiar el estado de los pedidos a CANCELADO ya que se emitió una nota de crédito
    for (const orderId of orderIds) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELADO' }
      });
      // Registrar historial de estado
      await this.prisma.orderStatusHistory.create({
        data: {
          order_id: orderId,
          changed_by: userId,
          from_status: originalInvoiceOrders.find(o => o.id === orderId)?.status || 'ENTREGADO',
          to_status: 'CANCELADO',
          notes: 'Cancelado automáticamente por generación de Nota de Crédito'
        }
      });
    }

    return creditNote;
  }
}
