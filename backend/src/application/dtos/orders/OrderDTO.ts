import { z } from 'zod';

// --- Schemas de validación Zod para pedidos ---

/** Schema para crear un nuevo pedido */
export const CreateOrderSchema = z.object({
  clientId: z.string().uuid('ID de cliente inválido'),
  productId: z.string().uuid('ID de producto inválido'),
  productDescription: z.string().min(2, 'La descripción debe tener al menos 2 caracteres'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  specifications: z.record(z.string(), z.unknown()).nullish(),
  unitPrice: z.number().nonnegative('El precio unitario debe ser mayor o igual a 0'),
  deliveryDate: z.string().datetime({ offset: true }).or(z.string().date()).nullish(),
  notes: z.string().nullish(),
  designFileReference: z.string().nullish(),
  chargedToAccount: z.boolean().default(false),
});

/** Schema para actualizar un pedido existente */
export const UpdateOrderSchema = z.object({
  productDescription: z.string().min(2, 'La descripción debe tener al menos 2 caracteres').optional(),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0').optional(),
  specifications: z.record(z.string(), z.unknown()).nullish(),
  unitPrice: z.number().nonnegative('El precio unitario debe ser mayor o igual a 0').optional(),
  deliveryDate: z.string().datetime({ offset: true }).or(z.string().date()).nullish(),
  notes: z.string().nullish(),
  designFileReference: z.string().nullish(),
});

/** Schema para actualizar el estado de un pedido */
export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'RECIBIDO',
    'ESPERANDO_DISENO',
    'ESPERANDO_CONFIRMACION',
    'EN_PRODUCCION',
    'TERMINADO',
    'ENTREGADO',
    'CANCELADO',
  ]),
  notes: z.string().nullish(),
});

/** Schema para filtros de listado de pedidos (query params) */
export const OrderFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  clientId: z.string().uuid('ID de cliente inválido').optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// --- Tipos inferidos ---
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type OrderFiltersInput = z.infer<typeof OrderFiltersSchema>;

/** DTO de respuesta para la API — representa un pedido serializado con relaciones opcionales */
export interface OrderResponseDTO {
  id: string;
  orderNumber: string;
  clientId: string;
  createdBy: string;
  productId: string;
  productDescription: string;
  quantity: number;
  specifications: Record<string, unknown> | null;
  unitPrice: number;
  status: string;
  deliveryDate: string | null;
  notes: string | null;
  designFileReference: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  chargedToAccount: boolean;
  invoiceId: string | null;
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales (incluidas en detalle)
  client?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
  product?: {
    id: string;
    name: string;
    categoryId: string;
  };
  statusHistory?: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    changedBy: string | null;
    notes: string | null;
    createdAt: string;
  }>;
}
