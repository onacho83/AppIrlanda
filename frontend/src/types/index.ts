/** Tipos principales del sistema Imprenta Irlanda */
export const __dummy = true;

/* ── Roles y Enums ── */

export type Role = 'ADMIN' | 'OPERADOR';

export type OrderStatus =
  | 'RECIBIDO'
  | 'ESPERANDO_DISENO'
  | 'ESPERANDO_CONFIRMACION'
  | 'EN_PRODUCCION'
  | 'TERMINADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type QuoteStatus = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | 'VENCIDO';
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';
export type IvaCondition = 'RESPONSABLE_INSCRIPTO' | 'MONOTRIBUTISTA' | 'CONSUMIDOR_FINAL' | 'EXENTO';
export type PricingType = 'FIJO' | 'CALCULADO';

/* ── Auth ── */

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

/* ── Categoría de producto ── */

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  active: boolean;
}

/* ── Producto ── */

export interface Product {
  id: string;
  categoryId: string;
  category?: ProductCategory;
  name: string;
  description?: string;
  pricingType: PricingType;
  basePrice: number;
  pricingRules?: Record<string, unknown>;
  active: boolean;
  createdAt: string;
}

/* ── Cliente ── */

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  cuit?: string;
  fiscalName?: string;
  ivaCondition: IvaCondition;
  hasCurrentAccount: boolean;
  creditLimit?: number;
  trackingToken: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Historial de estado de pedido ── */

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  changedBy: string;
  changedByName?: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  notes?: string;
  createdAt: string;
}

/* ── Pedido ── */

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  client?: Client;
  createdBy: string;
  productId: string;
  product?: Product;
  productDescription: string;
  quantity: number;
  specifications?: Record<string, unknown>;
  unitPrice: number;
  status: OrderStatus;
  deliveryDate?: string;
  notes?: string;
  designFileReference?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  chargedToAccount: boolean;
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

/* ── Pagos y Cuenta Corriente ── */

export type AccountMovementType = 'CARGO' | 'PAGO';

export interface Payment {
  id: string;
  orderId?: string;
  order?: Order;
  clientId: string;
  client?: Client;
  registeredBy?: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface AccountMovement {
  id: string;
  clientId: string;
  client?: Client;
  orderId?: string;
  paymentId?: string;
  type: AccountMovementType;
  amount: number;
  balanceAfter: number;
  description?: string;
  registeredBy?: string;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  product?: Product;
  description?: string;
  quantity: number;
  specifications?: Record<string, unknown>;
  unitPrice: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  client?: Client;
  createdBy: string;
  status: QuoteStatus;
  validUntil?: string;
  notes?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  convertedOrderId?: string;
  items?: QuoteItem[];
  createdAt: string;
}

/* ── Params para listados ── */

export interface ClientListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  active?: boolean;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/* ── Inputs de creación/actualización ── */

export interface CreateClientInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  cuit?: string;
  fiscalName?: string;
  ivaCondition: IvaCondition;
  hasCurrentAccount?: boolean;
  creditLimit?: number;
  notes?: string;
}

export type UpdateClientInput = Partial<CreateClientInput>;

export interface CreateProductInput {
  name: string;
  categoryId: string;
  description?: string;
  pricingType: PricingType;
  basePrice: number;
  pricingRules?: Record<string, unknown>;
  active?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface CreateCategoryInput {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface CreateOrderInput {
  clientId: string;
  productId: string;
  productDescription: string;
  quantity: number;
  specifications?: Record<string, unknown>;
  unitPrice: number;
  deliveryDate?: string;
  notes?: string;
  designFileReference?: string;
  chargedToAccount?: boolean;
}

export type UpdateOrderInput = Partial<Omit<CreateOrderInput, 'clientId'>>;

export interface CreateQuoteItemInput {
  productId: string;
  description?: string;
  quantity: number;
  specifications?: Record<string, unknown>;
  unitPrice: number;
}

export interface CreateQuoteInput {
  clientId: string;
  validUntil?: string;
  notes?: string;
  items: CreateQuoteItemInput[];
}

export interface UpdateStatusInput {
  status: OrderStatus;
  notes?: string;
}

/* ── Respuestas genéricas ── */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}
