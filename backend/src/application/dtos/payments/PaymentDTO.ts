import { z } from 'zod';
import { PaymentMethod } from '../../../domain/entities/Payment';

export const RegisterPaymentSchema = z.object({
  clientId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  orderId: z.string().uuid().optional().nullable(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RegisterPaymentInput = z.infer<typeof RegisterPaymentSchema>;

export const UpdatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
