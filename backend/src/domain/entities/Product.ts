// Tipos de pricing: precio fijo o calculado según reglas
export enum PricingType {
  FIJO = 'FIJO',
  CALCULADO = 'CALCULADO',
}

/**
 * Categoría de producto (ej: Tarjetas, Folletos, Banners).
 * Permite organizar los productos del catálogo.
 */
export class ProductCategory {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public sortOrder: number,
    public active: boolean
  ) {}
}

/**
 * Entidad de dominio que representa un producto/servicio de la imprenta.
 * Puede tener precio fijo o calculado según reglas definidas en pricingRules.
 */
export class Product {
  constructor(
    public readonly id: string,
    public categoryId: string,
    public name: string,
    public description: string | null,
    public pricingType: PricingType,
    public basePrice: number,
    public pricingRules: Record<string, unknown> | null,
    public active: boolean,
    public readonly createdAt: Date,
    public category?: ProductCategory
  ) {}
}
