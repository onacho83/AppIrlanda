import { z } from 'zod';

export const QuoteItemSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  description: z.string().nullish(),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  specifications: z.record(z.string(), z.unknown()).nullish(),
  unitPrice: z.number().nonnegative('El precio unitario debe ser mayor o igual a 0'),
});

export const CreateQuoteSchema = z.object({
  clientId: z.string().uuid('ID de cliente inválido'),
  validUntil: z.string().datetime({ offset: true }).or(z.string().date()).nullish(),
  notes: z.string().nullish(),
  items: z.array(QuoteItemSchema).min(1, 'El presupuesto debe tener al menos un ítem'),
});

export const QuoteFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'VENCIDO']).optional(),
  clientId: z.string().uuid('ID de cliente inválido').optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>;
export type QuoteFiltersInput = z.infer<typeof QuoteFiltersSchema>;

export interface QuoteItemResponseDTO {
  id: string;
  quoteId: string;
  productId: string;
  description: string | null;
  quantity: number;
  specifications: Record<string, unknown> | null;
  unitPrice: number;
  subtotal: number;
}

export interface QuoteResponseDTO {
  id: string;
  quoteNumber: string;
  clientId: string;
  createdBy: string;
  status: string;
  validUntil: string | null;
  notes: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  convertedOrderId: string | null;
  createdAt: string;
  items?: QuoteItemResponseDTO[];
  client?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
}
