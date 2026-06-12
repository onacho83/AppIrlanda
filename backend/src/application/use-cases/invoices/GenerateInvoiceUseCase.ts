import { IInvoiceRepository } from '../../../domain/repositories/IInvoiceRepository';
import { IInvoicingService } from '../../interfaces/IInvoicingService';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/errors/AppError';

interface GenerateInvoiceRequest {
  clientId: string;
  orderIds: string[];
  userId: string;
}

export class GenerateInvoiceUseCase {
  constructor(
    private invoiceRepo: IInvoiceRepository,
    private invoicingService: IInvoicingService,
    private prisma: PrismaClient
  ) {}

  async execute(req: GenerateInvoiceRequest) {
    if (!req.orderIds || req.orderIds.length === 0) {
      throw new AppError('Debe especificar al menos un pedido para facturar', 400);
    }

    // 1. Obtener cliente
    const client = await this.prisma.client.findUnique({ where: { id: req.clientId } });
    if (!client) throw new AppError('Cliente no encontrado', 404);

    // 2. Obtener pedidos y validar
    const orders = await this.prisma.order.findMany({
      where: {
        id: { in: req.orderIds }
      }
    });

    if (orders.length !== req.orderIds.length) {
      throw new AppError('Algunos pedidos no fueron encontrados', 404);
    }

    let totalNet = 0;
    let totalTax = 0;
    let totalAmount = 0;

    for (const order of orders) {
      if (order.client_id !== req.clientId) {
        throw new AppError(`El pedido ${order.order_number} no pertenece a este cliente`, 400);
      }
      if (order.invoice_id) {
        throw new AppError(`El pedido ${order.order_number} ya fue facturado`, 400);
      }

      totalNet += Number(order.subtotal);
      totalTax += Number(order.tax_amount);
      totalAmount += Number(order.total);
    }

    // 3. Determinar tipo de factura
    let invoiceType: 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' = 'FACTURA_C';
    const cuit = client.cuit ? client.cuit.replace(/[^0-9]/g, '') : '';

    if (client.iva_condition === 'RESPONSABLE_INSCRIPTO') {
      invoiceType = 'FACTURA_A';
    } else if (client.iva_condition === 'MONOTRIBUTISTA' || client.iva_condition === 'EXENTO' || client.iva_condition === 'CONSUMIDOR_FINAL') {
      invoiceType = 'FACTURA_B';
    }
    
    // Si la imprenta es Monotributista (InvoiceType C), siempre hace Factura C.
    // Esto dependera de la conf, pero por ahora lo dejamos como si la imprenta fuera Responsable Inscripto.
    // Si la imprenta factura C, podramos forzar FACTURA_C desde BusinessConfig.
    const config = await this.prisma.businessConfig.findFirst();
    if (config?.iva_condition === 'MONOTRIBUTISTA') {
      invoiceType = 'FACTURA_C';
    }

    // 4. Conectar con AFIP
    const afipRes = await this.invoicingService.generateInvoice({
      clientId: client.id,
      invoiceType,
      netAmount: totalNet,
      taxAmount: totalTax,
      total: totalAmount,
      cuit: cuit
    });

    // 5. Guardar Factura en DB
    const invoice = await this.invoiceRepo.create({
      clientId: client.id,
      createdBy: req.userId,
      invoiceType,
      salePoint: afipRes.salePoint,
      invoiceNumber: afipRes.invoiceNumber,
      cae: afipRes.cae,
      caeExpiration: afipRes.caeExpiration,
      netAmount: totalNet,
      taxAmount: totalTax,
      total: totalAmount,
      qrData: afipRes.qrData,
      arcaRequest: afipRes.arcaRequest,
      arcaResponse: afipRes.arcaResponse,
      originalInvoiceId: null
    }, req.orderIds);

    // 6. Cambiar el estado de los pedidos a ENTREGADO si estaban en TERMINADO (opcional, dependera de la logica de negocio)
    // Por ahora solo los facturamos, no tocamos el estado del workflow del taller a menos que sea necesario.

    return invoice;
  }
}
