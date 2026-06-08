import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { ProductCategory, Product } from '../../types';
import { productService } from '../../services/productService';
import { ProductFormModal } from './ProductFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import './CatalogPage.css';

export const CatalogPage: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>(undefined);

  const fetchCategories = async () => {
    try {
      const result = await productService.getCategories();
      setCategories(result);
      if (result.length > 0 && !activeCategoryId) {
        setActiveCategoryId(result[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async (categoryId: string) => {
    try {
      setLoadingProducts(true);
      const result = await productService.getAll({ categoryId, limit: 100 });
      setProducts(result.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeCategoryId) {
      fetchProducts(activeCategoryId);
    } else {
      setProducts([]);
    }
  }, [activeCategoryId]);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleNewProduct = () => {
    setSelectedProduct(undefined);
    setIsProductModalOpen(true);
  };

  const handleEditCategory = (e: React.MouseEvent, category: ProductCategory) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleNewCategory = () => {
    setSelectedCategory(undefined);
    setIsCategoryModalOpen(true);
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  return (
    <div className="catalog-page">
      <div className="catalog-page__header">
        <h1 className="catalog-page__title">Catálogo de Productos</h1>
        <div className="catalog-page__actions">
          <Button variant="secondary" onClick={handleNewCategory}>Nueva Categoría</Button>
          <Button variant="primary" onClick={handleNewProduct} disabled={!activeCategoryId}>
            Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="catalog-page__content">
        <aside className="catalog-categories">
          <Card padding="none">
            <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Categorías</h3>
            </div>
            <div className="catalog-categories__list" style={{ padding: 'var(--spacing-2)' }}>
              {categories.length === 0 ? (
                <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No hay categorías
                </div>
              ) : (
                categories.map(category => (
                  <button
                    key={category.id}
                    className={`catalog-category-item ${activeCategoryId === category.id ? 'catalog-category-item--active' : ''}`}
                    onClick={() => setActiveCategoryId(category.id)}
                  >
                    <span>{category.name}</span>
                    <div className="catalog-category-item__actions">
                      <button onClick={(e) => handleEditCategory(e, category)} aria-label="Editar">✏️</button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </aside>

        <main className="catalog-products">
          <div className="catalog-products__header">
            <h2 className="catalog-products__title">
              {activeCategory ? activeCategory.name : 'Selecciona una categoría'}
            </h2>
          </div>

          {loadingProducts ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-12)' }}>
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <EmptyState 
              icon="🛍️" 
              title="No hay productos" 
              description={activeCategory ? "Esta categoría no tiene productos." : "Crea productos para empezar a vender."} 
            />
          ) : (
            <div className="catalog-products__grid">
              {products.map(product => (
                <Card key={product.id} className="product-card" padding="md">
                  <div className="product-card__content">
                    <div className="product-card__header">
                      <h3 className="product-card__title">{product.name}</h3>
                      {!product.active && <span style={{ fontSize: '0.75rem', background: 'var(--color-surface-hover)', padding: '2px 6px', borderRadius: '4px' }}>Inactivo</span>}
                    </div>
                    <p className="product-card__desc">{product.description || 'Sin descripción'}</p>
                    <div className="product-card__price">
                      ${product.basePrice.toLocaleString()} {product.pricingType === 'CALCULADO' && <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>(Calculado)</span>}
                    </div>
                  </div>
                  <div className="product-card__footer">
                    <Button variant="secondary" size="sm" onClick={() => handleEditProduct(product)}>Editar</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <CategoryFormModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        onSuccess={() => fetchCategories()}
      />

      <ProductFormModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        categoryId={activeCategoryId || ''}
        onSuccess={() => {
          if (activeCategoryId) fetchProducts(activeCategoryId);
        }}
      />
    </div>
  );
};
