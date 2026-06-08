import { z } from 'zod';

// --- Schemas de validación Zod para productos ---

/** Schema para crear un nuevo producto */
export const CreateProductSchema = z.object({
  categoryId: z.string().uuid('ID de categoría inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().nullish(),
  pricingType: z.enum(['FIJO', 'CALCULADO']).default('FIJO'),
  basePrice: z.number().nonnegative('El precio base debe ser mayor o igual a 0'),
  pricingRules: z.record(z.string(), z.unknown()).nullish(),
  active: z.boolean().default(true),
});

/** Schema para actualizar un producto existente */
export const UpdateProductSchema = z.object({
  categoryId: z.string().uuid('ID de categoría inválido').optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().nullish(),
  pricingType: z.enum(['FIJO', 'CALCULADO']).optional(),
  basePrice: z.number().nonnegative('El precio base debe ser mayor o igual a 0').optional(),
  pricingRules: z.record(z.string(), z.unknown()).nullish(),
  active: z.boolean().optional(),
});

/** Schema para filtros de listado de productos (query params) */
export const ProductFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid('ID de categoría inválido').optional(),
  active: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

/** Schema para crear una nueva categoría de producto */
export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().nullish(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

/** Schema para actualizar una categoría de producto */
export const UpdateCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().nullish(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

// --- Tipos inferidos ---
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductFiltersInput = z.infer<typeof ProductFiltersSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
