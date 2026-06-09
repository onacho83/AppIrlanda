import { z } from 'zod';

// --- Schemas de validación Zod para clientes ---

/** Schema para crear un nuevo cliente */
export const CreateClientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().nullish(),
  email: z.string().email('Email inválido').nullish(),
  address: z.string().nullish(),
  cuit: z.string().nullish(),
  fiscalName: z.string().nullish(),
  ivaCondition: z
    .enum(['RESPONSABLE_INSCRIPTO', 'MONOTRIBUTISTA', 'CONSUMIDOR_FINAL', 'EXENTO'])
    .default('CONSUMIDOR_FINAL'),
  hasCurrentAccount: z.boolean().default(false),
  creditLimit: z.number().positive('El límite de crédito debe ser positivo').nullish(),
  notes: z.string().nullish(),
});

/** Schema para actualizar un cliente existente (todos los campos opcionales) */
export const UpdateClientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  phone: z.string().nullish(),
  email: z.string().email('Email inválido').nullish(),
  address: z.string().nullish(),
  cuit: z.string().nullish(),
  fiscalName: z.string().nullish(),
  ivaCondition: z
    .enum(['RESPONSABLE_INSCRIPTO', 'MONOTRIBUTISTA', 'CONSUMIDOR_FINAL', 'EXENTO'])
    .optional(),
  hasCurrentAccount: z.boolean().optional(),
  creditLimit: z.number().positive('El límite de crédito debe ser positivo').nullish(),
  notes: z.string().nullish(),
});

/** Schema para filtros de listado de clientes (query params) */
export const ClientFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(20),
  search: z.string().optional(),
  hasCurrentAccount: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

// --- Tipos inferidos ---
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ClientFiltersInput = z.infer<typeof ClientFiltersSchema>;

/** DTO de respuesta para la API — representa un cliente serializado */
export interface ClientResponseDTO {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  cuit: string | null;
  fiscalName: string | null;
  ivaCondition: string;
  hasCurrentAccount: boolean;
  creditLimit: number | null;
  trackingToken: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
