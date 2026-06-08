import api from './api';
import type {
  ProductListParams,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  Product,
  ProductCategory,
  PaginatedResponse,
} from '../types';

/** Servicio de productos y categorías — interacción con la API */
export const productService = {
  /** Obtener listado paginado de productos */
  getAll: async (params: ProductListParams) => {
    const res = await api.get<PaginatedResponse<Product>>('/products', { params });
    return res.data;
  },

  /** Obtener todas las categorías de productos */
  getCategories: async () => {
    const res = await api.get<ProductCategory[]>('/products/categories');
    return res.data;
  },

  /** Obtener un producto por ID */
  getById: async (id: string) => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },

  /** Crear un nuevo producto */
  create: async (data: CreateProductInput) => {
    const res = await api.post<Product>('/products', data);
    return res.data;
  },

  /** Actualizar un producto existente */
  update: async (id: string, data: UpdateProductInput) => {
    const res = await api.put<Product>(`/products/${id}`, data);
    return res.data;
  },

  /** Crear una nueva categoría de productos */
  createCategory: async (data: CreateCategoryInput) => {
    const res = await api.post<ProductCategory>('/products/categories', data);
    return res.data;
  },

  /** Actualizar categoría de productos */
  updateCategory: async (id: string, data: Partial<CreateCategoryInput>) => {
    const res = await api.put<ProductCategory>(`/products/categories/${id}`, data);
    return res.data;
  },
};
