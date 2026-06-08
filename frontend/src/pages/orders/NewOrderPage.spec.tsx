import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewOrderPage } from './NewOrderPage';
import { clientService } from '../../services/clientService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

// Mockear los servicios
vi.mock('../../services/clientService');
vi.mock('../../services/productService');
vi.mock('../../services/orderService');

// Mockear react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NewOrderPage View', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup de datos mockeados
    (clientService.getAll as any).mockResolvedValue({
      data: [
        { id: 'client-1', name: 'Juan Perez', cuit: '20111111112', hasCurrentAccount: false },
        { id: 'client-2', name: 'Empresa S.A.', cuit: '30222222221', hasCurrentAccount: true, creditLimit: 50000 },
      ]
    });

    (productService.getAll as any).mockResolvedValue({
      data: [
        { id: 'prod-1', name: 'Tarjetas Personales', basePrice: 5000 },
        { id: 'prod-2', name: 'Volantes A5', basePrice: 15000 },
      ]
    });
  });

  it('debe renderizar el formulario correctamente luego de cargar los datos', async () => {
    render(
      <MemoryRouter>
        <NewOrderPage />
      </MemoryRouter>
    );

    // Esperar a que los combos se llenen
    await waitFor(() => {
      expect(screen.getByText('Juan Perez (20111111112)')).toBeInTheDocument();
      expect(screen.getByText('Tarjetas Personales ($5000)')).toBeInTheDocument();
    });

    // Validar elementos iniciales de la vista
    expect(screen.getByLabelText(/Cliente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Producto Base/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cantidad/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Pedido/i })).toBeInTheDocument();
  });

  it('debe mostrar error de validación si se intenta enviar vacío', async () => {
    render(
      <MemoryRouter>
        <NewOrderPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Juan Perez (20111111112)')).toBeInTheDocument());

    const submitBtn = screen.getByRole('button', { name: /Crear Pedido/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Por favor completa todos los campos obligatorios correctamente.')).toBeInTheDocument();
    expect(orderService.create).not.toHaveBeenCalled();
  });

  it('debe calcular el total dinámicamente y permitir el envío', async () => {
    (orderService.create as any).mockResolvedValue({ id: 'new-order-123' });
    
    render(
      <MemoryRouter>
        <NewOrderPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Juan Perez (20111111112)')).toBeInTheDocument());

    // Completar el formulario
    await userEvent.selectOptions(screen.getByLabelText(/Cliente \*/i), 'client-1');
    await userEvent.selectOptions(screen.getByLabelText(/Producto Base \*/i), 'prod-1');

    // La descripción y precio unitario se auto-completan, verificamos y modificamos
    const qtyInput = screen.getByLabelText(/Cantidad \*/i);
    await userEvent.clear(qtyInput);
    await userEvent.type(qtyInput, '2');

    // Subtotal = 2 * 5000 = 10000, Tax = 2100, Total = 12100
    // Verificamos que se renderice el total esperado en la vista
    // toLocaleString() en este entorno renderiza con punto (12.100)
    expect(screen.getByText('$12.100')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Crear Pedido/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(orderService.create).toHaveBeenCalledWith({
        clientId: 'client-1',
        productId: 'prod-1',
        productDescription: 'Tarjetas Personales', // autocompletado
        quantity: 2,
        unitPrice: 5000, // autocompletado
        chargedToAccount: false,
        designFileReference: undefined,
        notes: undefined,
      });
      // Debería redirigir al detalle del pedido
      expect(mockNavigate).toHaveBeenCalledWith('/pedidos/new-order-123');
    });
  });
});
